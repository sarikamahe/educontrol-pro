export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_overrides: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_by: string
          id: string
          is_active: boolean | null
          override_type: string
          reason: string
          student_id: string
          subject_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_by: string
          id?: string
          is_active?: boolean | null
          override_type: string
          reason: string
          student_id: string
          subject_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string
          id?: string
          is_active?: boolean | null
          override_type?: string
          reason?: string
          student_id?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_overrides_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_overrides_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_overrides_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          attachment_url: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string
          id: string
          is_active: boolean | null
          is_attendance_required: boolean | null
          max_score: number | null
          subject_id: string
          title: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date: string
          id?: string
          is_active?: boolean | null
          is_attendance_required?: boolean | null
          max_score?: number | null
          subject_id: string
          title: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string
          id?: string
          is_active?: boolean | null
          is_attendance_required?: boolean | null
          max_score?: number | null
          subject_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          created_at: string
          date: string
          id: string
          marked_by: string
          notes: string | null
          status: string
          student_id: string
          subject_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          marked_by: string
          notes?: string | null
          status: string
          student_id: string
          subject_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          marked_by?: string
          notes?: string | null
          status?: string
          student_id?: string
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_summary: {
        Row: {
          access_status: string | null
          attendance_percentage: number | null
          classes_attended: number | null
          id: string
          last_updated: string | null
          student_id: string
          subject_id: string
          total_classes: number | null
        }
        Insert: {
          access_status?: string | null
          attendance_percentage?: number | null
          classes_attended?: number | null
          id?: string
          last_updated?: string | null
          student_id: string
          subject_id: string
          total_classes?: number | null
        }
        Update: {
          access_status?: string | null
          attendance_percentage?: number | null
          classes_attended?: number | null
          id?: string
          last_updated?: string | null
          student_id?: string
          subject_id?: string
          total_classes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_summary_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_summary_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          academic_year: string | null
          created_at: string
          id: string
          is_active: boolean | null
          student_id: string
          subject_id: string
        }
        Insert: {
          academic_year?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          student_id: string
          subject_id: string
        }
        Update: {
          academic_year?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch_id: string | null
          created_at: string
          email: string
          enrollment_number: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          email: string
          enrollment_number?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          email?: string
          enrollment_number?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string
          description: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_active: boolean | null
          is_attendance_required: boolean | null
          resource_type: string
          subject_id: string
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          is_attendance_required?: boolean | null
          resource_type: string
          subject_id: string
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          is_attendance_required?: boolean | null
          resource_type?: string
          subject_id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_branches: {
        Row: {
          branch_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          subject_id: string
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          subject_id: string
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_branches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_branches_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          branch_id: string
          code: string
          created_at: string
          credits: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          semester: number | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          code: string
          created_at?: string
          credits?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          semester?: number | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          code?: string
          created_at?: string
          credits?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          semester?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assignment_id: string
          feedback: string | null
          file_name: string | null
          file_url: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          notes: string | null
          score: number | null
          status: string | null
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          file_name?: string | null
          file_url?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          notes?: string | null
          score?: number | null
          status?: string | null
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          file_name?: string | null
          file_url?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          notes?: string | null
          score?: number | null
          status?: string | null
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_subjects: {
        Row: {
          academic_year: string | null
          created_at: string
          id: string
          is_active: boolean | null
          subject_id: string
          teacher_id: string
        }
        Insert: {
          academic_year?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          subject_id: string
          teacher_id: string
        }
        Update: {
          academic_year?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          subject_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_branch: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_teacher_of_subject: {
        Args: { _subject_id: string; _user_id: string }
        Returns: boolean
      }
      student_has_access: {
        Args: { _student_id: string; _subject_id: string }
        Returns: boolean
      }
      subject_has_branch: {
        Args: { _branch_id: string; _subject_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "teacher", "student"],
    },
  },
} as const
