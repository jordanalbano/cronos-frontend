import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { MessageService } from 'primeng/api';
import {
  MonthlyClosure,
  MonthlyClosureDetail,
  MonthlyClosurePreview,
  MonthlyClosureFilters,
  MonthlyClosureWithDetails,
  MonthlyClosureStatus
} from '../../shared/models/monthly-closure.model';

interface MonthlyClosureState {
  closures: MonthlyClosure[];
  currentClosure: MonthlyClosureWithDetails | null;
  preview: MonthlyClosurePreview | null;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MonthlyClosureService {
  private supabase = inject(SupabaseService);
  private messageService = inject(MessageService);

  private state = signal<MonthlyClosureState>({
    closures: [],
    currentClosure: null,
    preview: null,
    loading: false,
    error: null
  });

  public readonly closures = computed(() => this.state().closures);
  public readonly currentClosure = computed(() => this.state().currentClosure);
  public readonly preview = computed(() => this.state().preview);
  public readonly loading = computed(() => this.state().loading);
  public readonly error = computed(() => this.state().error);

  async loadClosures(filters?: MonthlyClosureFilters): Promise<void> {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    try {
      let query = this.supabase.client
        .from('monthly_closures')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (filters?.year) {
        query = query.eq('year', filters.year);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      const closures = (data || []).map(this.mapFromDb);
      this.state.update(s => ({ ...s, closures, loading: false }));
    } catch (error: any) {
      const message = 'Error al cargar los cierres mensuales';
      this.state.update(s => ({ ...s, error: message, loading: false }));
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    }
  }

  async loadClosureWithDetails(closureId: string): Promise<void> {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    try {
      const { data: closureData, error: closureError } = await this.supabase.client
        .from('monthly_closures')
        .select('*')
        .eq('id', closureId)
        .maybeSingle();

      if (closureError) throw closureError;
      if (!closureData) throw new Error('Cierre no encontrado');

      const { data: detailsData, error: detailsError } = await this.supabase.client
        .from('monthly_closure_details')
        .select('*')
        .eq('closure_id', closureId)
        .order('exceeded_hours', { ascending: false });

      if (detailsError) throw detailsError;

      const closure = this.mapFromDb(closureData);
      const details = (detailsData || []).map(this.mapDetailFromDb);

      const currentClosure: MonthlyClosureWithDetails = {
        ...closure,
        details
      };

      this.state.update(s => ({ ...s, currentClosure, loading: false }));
    } catch (error: any) {
      const message = 'Error al cargar el detalle del cierre';
      this.state.update(s => ({ ...s, error: message, loading: false }));
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    }
  }

  async generatePreview(month: number, year: number): Promise<void> {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    try {
      const { data: configData } = await this.supabase.client
        .from('monthly_hours_config')
        .select('monthly_hours')
        .limit(1)
        .maybeSingle();

      const allowedMonthlyHours = configData?.monthly_hours || 160;

      const preview: MonthlyClosurePreview = {
        month,
        year,
        totalHours: 0,
        totalExceededHours: 0,
        totalEmployees: 0,
        employeesExceeded: 0,
        allowedMonthlyHours,
        details: [],
        hasInProgressClockings: false,
        inProgressClockingsCount: 0
      };

      this.state.update(s => ({ ...s, preview, loading: false }));

      this.messageService.add({
        severity: 'info',
        summary: 'Vista previa generada',
        detail: 'Esta es una vista previa con datos simulados. La integración completa con fichajes reales está pendiente.'
      });
    } catch (error: any) {
      const message = 'Error al generar la vista previa';
      this.state.update(s => ({ ...s, error: message, loading: false }));
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    }
  }

  async closeMon(month: number, year: number, closedBy: string, notes?: string): Promise<boolean> {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    try {
      const preview = this.state().preview;
      if (!preview) {
        throw new Error('Debe generar una vista previa antes de cerrar el mes');
      }

      const { data: closureData, error: closureError } = await this.supabase.client
        .from('monthly_closures')
        .insert({
          month,
          year,
          status: 'closed',
          total_hours: preview.totalHours,
          total_exceeded_hours: preview.totalExceededHours,
          total_employees: preview.totalEmployees,
          employees_exceeded: preview.employeesExceeded,
          allowed_monthly_hours: preview.allowedMonthlyHours,
          notes,
          closed_at: new Date().toISOString(),
          closed_by: closedBy
        })
        .select()
        .single();

      if (closureError) throw closureError;

      const detailsToInsert = preview.details.map(detail => ({
        closure_id: closureData.id,
        user_id: detail.userId,
        user_name: detail.userName,
        user_email: detail.userEmail,
        total_monthly_hours: detail.totalMonthlyHours,
        allowed_hours: detail.allowedHours,
        exceeded_hours: detail.exceededHours,
        total_clockings: detail.totalClockings,
        status: detail.status
      }));

      if (detailsToInsert.length > 0) {
        const { error: detailsError } = await this.supabase.client
          .from('monthly_closure_details')
          .insert(detailsToInsert);

        if (detailsError) throw detailsError;
      }

      this.state.update(s => ({ ...s, loading: false, preview: null }));
      this.messageService.add({
        severity: 'success',
        summary: 'Mes cerrado',
        detail: `El mes ${month}/${year} ha sido cerrado exitosamente`
      });

      await this.loadClosures();
      return true;
    } catch (error: any) {
      const message = error.message || 'Error al cerrar el mes';
      this.state.update(s => ({ ...s, error: message, loading: false }));
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
      return false;
    }
  }

  async reopenMonth(closureId: string, reopenedBy: string): Promise<boolean> {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    try {
      const { error } = await this.supabase.client
        .from('monthly_closures')
        .update({
          status: 'open',
          updated_at: new Date().toISOString()
        })
        .eq('id', closureId);

      if (error) throw error;

      this.state.update(s => ({ ...s, loading: false }));
      this.messageService.add({
        severity: 'success',
        summary: 'Mes reabierto',
        detail: 'El mes ha sido reabierto exitosamente'
      });

      await this.loadClosures();
      return true;
    } catch (error: any) {
      const message = 'Error al reabrir el mes';
      this.state.update(s => ({ ...s, error: message, loading: false }));
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
      return false;
    }
  }

  async updateClosureNotes(closureId: string, notes: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('monthly_closures')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', closureId);

      if (error) throw error;

      this.messageService.add({
        severity: 'success',
        summary: 'Notas actualizadas',
        detail: 'Las notas han sido guardadas'
      });
      return true;
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar las notas'
      });
      return false;
    }
  }

  async updateDetailNotes(detailId: string, notes: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('monthly_closure_details')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', detailId);

      if (error) throw error;

      this.messageService.add({
        severity: 'success',
        summary: 'Notas actualizadas',
        detail: 'Las notas del empleado han sido guardadas'
      });
      return true;
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar las notas'
      });
      return false;
    }
  }

  async checkMonthStatus(month: number, year: number): Promise<MonthlyClosureStatus | null> {
    try {
      const { data } = await this.supabase.client
        .from('monthly_closures')
        .select('status')
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      return data?.status || null;
    } catch (error) {
      return null;
    }
  }

  private mapFromDb(data: any): MonthlyClosure {
    return {
      id: data.id,
      month: data.month,
      year: data.year,
      status: data.status,
      totalHours: parseFloat(data.total_hours),
      totalExceededHours: parseFloat(data.total_exceeded_hours),
      totalEmployees: data.total_employees,
      employeesExceeded: data.employees_exceeded,
      allowedMonthlyHours: parseFloat(data.allowed_monthly_hours),
      notes: data.notes,
      closedAt: data.closed_at ? new Date(data.closed_at) : undefined,
      closedBy: data.closed_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapDetailFromDb(data: any): MonthlyClosureDetail {
    return {
      id: data.id,
      closureId: data.closure_id,
      userId: data.user_id,
      userName: data.user_name,
      userEmail: data.user_email,
      totalMonthlyHours: parseFloat(data.total_monthly_hours),
      allowedHours: parseFloat(data.allowed_hours),
      exceededHours: parseFloat(data.exceeded_hours),
      totalClockings: data.total_clockings,
      status: data.status,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}
