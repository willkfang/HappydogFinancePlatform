<script lang="ts">
	import HomeIcon from '@lucide/svelte/icons/house';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import TableIcon from '@lucide/svelte/icons/table-properties';
	import ChartIcon from '@lucide/svelte/icons/chart-column';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';

	const items = [
		{ href: '/', label: 'Overview', icon: HomeIcon },
		{ href: '/quick-add', label: 'Quick Add', icon: PlusIcon },
		{ href: '/transactions', label: 'Transactions', icon: ReceiptIcon },
		{ href: '/admin', label: 'Admin', icon: TableIcon },
		{ href: '/reports', label: 'Reports', icon: ChartIcon },
		{ href: '/planning', label: 'Planning', icon: TrendingUpIcon },
		{ href: '/settings', label: 'Settings', icon: SettingsIcon }
	] as const;
</script>

<nav class="grid gap-2">
	{#each items as item (item.href)}
		<a
			href={resolve(item.href)}
			class={cn(
				'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
				page.url.pathname === item.href ||
					(item.href !== '/' && page.url.pathname.startsWith(item.href))
					? 'bg-primary text-primary-foreground shadow-sm'
					: 'text-muted-foreground hover:bg-muted hover:text-foreground'
			)}
		>
			<item.icon class="size-4" />
			<span>{item.label}</span>
		</a>
	{/each}
</nav>
