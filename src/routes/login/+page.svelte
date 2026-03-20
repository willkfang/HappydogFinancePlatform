<script lang="ts">
	import * as Card from '$ui/card';
	import Button from '$ui/button/button.svelte';
	import Input from '$ui/input/input.svelte';
	import type { PageData } from './$types';

	type LoginFormState = {
		status?: number;
		message?: string;
		errors?: {
			email?: string[];
			password?: string[];
			form?: string[];
		};
		values?: {
			email: string;
			password: string;
		};
	};

	let { data, form }: { data: PageData; form: LoginFormState | null } = $props();

	const values = $derived(form?.values ?? { email: '', password: '' });
	const setupMessage = $derived.by(() => {
		if (form?.message) return form.message;
		if (data.reason === 'household-access') {
			return 'This account signed in successfully, but it is not linked to a household yet.';
		}

		return null;
	});
</script>

<div class="mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
	<Card.Root class="w-full border-none bg-card/95 shadow-sm">
		<Card.Header>
			<p class="text-xs font-semibold tracking-[0.28em] text-muted-foreground uppercase">
				Happy Dog Finance
			</p>
			<h1 class="text-3xl font-semibold tracking-tight">Sign in</h1>
			<Card.Description>
				Use a Supabase Auth user that is already mapped into `household_users`.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" class="grid gap-4">
				<input type="hidden" name="redirectTo" value={data.redirectTo} />
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Email</span>
					<Input
						name="email"
						type="email"
						autocomplete="email"
						placeholder="you@example.com"
						value={values.email}
					/>
					{#if form?.errors?.email}
						<span class="text-xs text-destructive">{form.errors.email[0]}</span>
					{/if}
				</label>

				<label class="grid gap-2 text-sm">
					<span class="font-medium">Password</span>
					<Input
						name="password"
						type="password"
						autocomplete="current-password"
						value={values.password}
					/>
					{#if form?.errors?.password}
						<span class="text-xs text-destructive">{form.errors.password[0]}</span>
					{/if}
				</label>

				{#if setupMessage}
					<p class="text-sm text-destructive">{setupMessage}</p>
				{:else if !data.configured}
					<p class="text-sm text-muted-foreground">
						Add the public Supabase environment values before expecting sign-in to work.
					</p>
				{/if}

				<Button disabled={!data.configured}>Sign in</Button>
			</form>

			<div class="mt-6 rounded-xl border bg-muted/40 p-4 text-sm">
				<p class="font-medium">Setup checklist</p>
				<ul class="mt-2 space-y-2 text-muted-foreground">
					<li>1. Add the two public Supabase env vars for local and Vercel.</li>
					<li>2. Create the two Supabase Auth users in the dashboard.</li>
					<li>3. Run `launch_bootstrap.sql` to map those users into `household_users`.</li>
					<li>4. Run `reference_dimensions.sql` so Quick Add has real save options.</li>
				</ul>
			</div>
		</Card.Content>
	</Card.Root>
</div>
