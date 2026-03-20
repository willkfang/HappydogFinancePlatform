export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Database {
	public: {
		Tables: {
			accounts: {
				Row: {
					account_kind: string;
					created_at: string;
					household_id: string;
					id: string;
					institution_name: string;
					is_active: boolean;
					name: string;
				};
				Insert: {
					account_kind?: string;
					created_at?: string;
					household_id: string;
					id?: string;
					institution_name?: string;
					is_active?: boolean;
					name: string;
				};
				Update: Partial<Database['public']['Tables']['accounts']['Insert']>;
				Relationships: [];
			};
			budget_targets: {
				Row: {
					annualized: boolean;
					category_name: string;
					created_at: string;
					household_id: string;
					id: string;
					period: string;
					scope: string;
					target_amount: number;
				};
				Insert: {
					annualized?: boolean;
					category_name: string;
					created_at?: string;
					household_id: string;
					id?: string;
					period?: string;
					scope: string;
					target_amount: number;
				};
				Update: Partial<Database['public']['Tables']['budget_targets']['Insert']>;
				Relationships: [];
			};
			categories: {
				Row: {
					created_at: string;
					household_id: string;
					id: string;
					is_active: boolean;
					name: string;
					parent_category_id: string | null;
				};
				Insert: {
					created_at?: string;
					household_id: string;
					id?: string;
					is_active?: boolean;
					name: string;
					parent_category_id?: string | null;
				};
				Update: Partial<Database['public']['Tables']['categories']['Insert']>;
				Relationships: [];
			};
			expensors: {
				Row: {
					created_at: string;
					household_id: string;
					id: string;
					name: string;
				};
				Insert: {
					created_at?: string;
					household_id: string;
					id?: string;
					name: string;
				};
				Update: Partial<Database['public']['Tables']['expensors']['Insert']>;
				Relationships: [];
			};
			household_financial_profiles: {
				Row: {
					annual_earned_income: number | null;
					annual_rental_net_income: number | null;
					annual_retirement_contribution: number | null;
					created_at: string;
					current_age: number | null;
					current_cash_reserves: number | null;
					current_debt_balance: number | null;
					current_retirement_balance: number | null;
					current_taxable_balance: number | null;
					employer_match: number | null;
					household_id: string;
					id: string;
					include_rental_in_plan: boolean;
					income_growth_rate: number | null;
					inflation_rate: number | null;
					partner_current_age: number | null;
					partner_retirement_age: number | null;
					planning_end_age: number | null;
					retirement_age: number | null;
					retirement_spending_target: number | null;
					return_rate: number | null;
					updated_at: string;
					withdrawal_rate: number | null;
				};
				Insert: {
					annual_earned_income?: number | null;
					annual_rental_net_income?: number | null;
					annual_retirement_contribution?: number | null;
					created_at?: string;
					current_age?: number | null;
					current_cash_reserves?: number | null;
					current_debt_balance?: number | null;
					current_retirement_balance?: number | null;
					current_taxable_balance?: number | null;
					employer_match?: number | null;
					household_id: string;
					id?: string;
					include_rental_in_plan?: boolean;
					income_growth_rate?: number | null;
					inflation_rate?: number | null;
					partner_current_age?: number | null;
					partner_retirement_age?: number | null;
					planning_end_age?: number | null;
					retirement_age?: number | null;
					retirement_spending_target?: number | null;
					return_rate?: number | null;
					updated_at?: string;
					withdrawal_rate?: number | null;
				};
				Update: Partial<Database['public']['Tables']['household_financial_profiles']['Insert']>;
				Relationships: [];
			};
			household_users: {
				Row: {
					created_at: string;
					household_id: string;
					id: string;
					role: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					household_id: string;
					id?: string;
					role?: string;
					user_id: string;
				};
				Update: Partial<Database['public']['Tables']['household_users']['Insert']>;
				Relationships: [];
			};
			households: {
				Row: {
					created_at: string;
					id: string;
					name: string;
				};
				Insert: {
					created_at?: string;
					id?: string;
					name: string;
				};
				Update: Partial<Database['public']['Tables']['households']['Insert']>;
				Relationships: [];
			};
			merchants: {
				Row: {
					created_at: string;
					household_id: string;
					id: string;
					is_active: boolean;
					normalized_name: string;
				};
				Insert: {
					created_at?: string;
					household_id: string;
					id?: string;
					is_active?: boolean;
					normalized_name: string;
				};
				Update: Partial<Database['public']['Tables']['merchants']['Insert']>;
				Relationships: [];
			};
			payment_methods: {
				Row: {
					created_at: string;
					household_id: string;
					id: string;
					name: string;
				};
				Insert: {
					created_at?: string;
					household_id: string;
					id?: string;
					name: string;
				};
				Update: Partial<Database['public']['Tables']['payment_methods']['Insert']>;
				Relationships: [];
			};
			properties: {
				Row: {
					created_at: string;
					household_id: string;
					id: string;
					is_active: boolean;
					name: string;
					property_kind: string;
				};
				Insert: {
					created_at?: string;
					household_id: string;
					id?: string;
					is_active?: boolean;
					name: string;
					property_kind?: string;
				};
				Update: Partial<Database['public']['Tables']['properties']['Insert']>;
				Relationships: [];
			};
			retirement_scenarios: {
				Row: {
					assumption_payload: Json;
					created_at: string;
					household_id: string;
					id: string;
					name: string;
					scenario_kind: string;
				};
				Insert: {
					assumption_payload: Json;
					created_at?: string;
					household_id: string;
					id?: string;
					name: string;
					scenario_kind?: string;
				};
				Update: Partial<Database['public']['Tables']['retirement_scenarios']['Insert']>;
				Relationships: [];
			};
			transaction_attachments: {
				Row: {
					content_type: string | null;
					created_at: string;
					household_id: string;
					id: string;
					original_filename: string | null;
					storage_bucket: string;
					storage_path: string;
					transaction_id: string;
					uploaded_by: string | null;
				};
				Insert: {
					content_type?: string | null;
					created_at?: string;
					household_id: string;
					id?: string;
					original_filename?: string | null;
					storage_bucket?: string;
					storage_path: string;
					transaction_id: string;
					uploaded_by?: string | null;
				};
				Update: Partial<Database['public']['Tables']['transaction_attachments']['Insert']>;
				Relationships: [];
			};
			transaction_import_staging: {
				Row: {
					amount_raw: string;
					category_raw: string;
					expensor_raw: string;
					household_id: string;
					id: number;
					imported_at: string;
					legacy_source_id: string | null;
					note_raw: string;
					payment_method_raw: string;
					subtype_raw: string;
					transaction_date_raw: string;
					transaction_type_raw: string;
				};
				Insert: {
					amount_raw: string;
					category_raw: string;
					expensor_raw: string;
					household_id: string;
					id?: number;
					imported_at?: string;
					legacy_source_id?: string | null;
					note_raw?: string;
					payment_method_raw: string;
					subtype_raw: string;
					transaction_date_raw: string;
					transaction_type_raw: string;
				};
				Update: Partial<Database['public']['Tables']['transaction_import_staging']['Insert']>;
				Relationships: [];
			};
			transaction_reporting_profiles: {
				Row: {
					annualized: boolean;
					category_name: string;
					created_at: string;
					essentiality: string;
					household_id: string;
					id: string;
					lifecycle: string;
					property_id: string | null;
					scope: string;
				};
				Insert: {
					annualized?: boolean;
					category_name: string;
					created_at?: string;
					essentiality: string;
					household_id: string;
					id?: string;
					lifecycle: string;
					property_id?: string | null;
					scope: string;
				};
				Update: Partial<Database['public']['Tables']['transaction_reporting_profiles']['Insert']>;
				Relationships: [];
			};
			transaction_reviews: {
				Row: {
					created_at: string;
					household_id: string;
					id: string;
					review_note: string;
					review_status: string;
					reviewed_at: string | null;
					reviewed_by: string | null;
					transaction_id: string;
				};
				Insert: {
					created_at?: string;
					household_id: string;
					id?: string;
					review_note?: string;
					review_status?: string;
					reviewed_at?: string | null;
					reviewed_by?: string | null;
					transaction_id: string;
				};
				Update: Partial<Database['public']['Tables']['transaction_reviews']['Insert']>;
				Relationships: [];
			};
			transaction_subtypes: {
				Row: {
					created_at: string;
					household_id: string;
					id: string;
					name: string;
				};
				Insert: {
					created_at?: string;
					household_id: string;
					id?: string;
					name: string;
				};
				Update: Partial<Database['public']['Tables']['transaction_subtypes']['Insert']>;
				Relationships: [];
			};
			transactions: {
				Row: {
					account_id: string | null;
					amount: number;
					category_id: string | null;
					created_at: string;
					created_by: string | null;
					expensor_id: string | null;
					household_id: string;
					id: string;
					legacy_source_id: string | null;
					merchant_id: string | null;
					note: string;
					payment_method_id: string | null;
					raw_merchant_name: string;
					status: string;
					subtype_id: string | null;
					transaction_date: string;
					transaction_type: string;
					updated_at: string;
				};
				Insert: {
					account_id?: string | null;
					amount: number;
					category_id?: string | null;
					created_at?: string;
					created_by?: string | null;
					expensor_id?: string | null;
					household_id: string;
					id?: string;
					legacy_source_id?: string | null;
					merchant_id?: string | null;
					note?: string;
					payment_method_id?: string | null;
					raw_merchant_name?: string;
					status?: string;
					subtype_id?: string | null;
					transaction_date: string;
					transaction_type: string;
					updated_at?: string;
				};
				Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: {
			is_household_member: {
				Args: { target_household_id: string };
				Returns: boolean;
			};
		};
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
}
