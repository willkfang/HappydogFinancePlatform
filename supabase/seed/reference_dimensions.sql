-- Replace the household id below with the real household id after creating the first household row.
with household as (
	select '00000000-0000-0000-0000-000000000000'::uuid as household_id
)
insert into public.transaction_subtypes (household_id, name)
select household.household_id, values.name
from household
cross join (
	values
		('2035 Campbell'),
		('929 Kirts'),
		('DSO'),
		('GM'),
		('Personal'),
		('3127 Parker'),
		('26057 Hidden Valley'),
		('Wisk')
) as values(name)
on conflict (household_id, name) do nothing;

with household as (
	select '00000000-0000-0000-0000-000000000000'::uuid as household_id
)
insert into public.payment_methods (household_id, name)
select household.household_id, values.name
from household
cross join (
	values
		('Amazon Visa'),
		('Capital One Quiksilver'),
		('Capital One Venture'),
		('Cash'),
		('Chase Joint Checking'),
		('Chase Sapphire Reserve'),
		('Costco Citi'),
		('J BoA Checking'),
		('J BoA Saving'),
		('J Huntington Checking'),
		('J Huntington Saving'),
		('Venmo'),
		('W Chase Checking'),
		('Delta American Express'),
		('Chase Freedom Unlimited'),
		('Amex Blue Preferred')
) as values(name)
on conflict (household_id, name) do nothing;

with household as (
	select '00000000-0000-0000-0000-000000000000'::uuid as household_id
)
insert into public.expensors (household_id, name)
select household.household_id, values.name
from household
cross join (
	values
		('J'),
		('W'),
		('Shared')
) as values(name)
on conflict (household_id, name) do nothing;

with household as (
	select '00000000-0000-0000-0000-000000000000'::uuid as household_id
)
insert into public.categories (household_id, name)
select household.household_id, values.name
from household
cross join (
	values
		('2035 Campbell'),
		('929 Kirts'),
		('AAA Membership'),
		('Apparel'),
		('Appliances'),
		('Car Maintenance'),
		('Dog'),
		('Entertainment'),
		('Gasoline'),
		('Gifts'),
		('Groceries'),
		('Health'),
		('HOA'),
		('Hobby'),
		('Home Maintenance'),
		('Insurance'),
		('Lease'),
		('Misc'),
		('Mortgage'),
		('Personal Care'),
		('Restaurants'),
		('School'),
		('Taxes'),
		('Travel'),
		('Union Dues'),
		('Utilities'),
		('Violin'),
		('Fees'),
		('Kids'),
		('Salary'),
		('Rental Income'),
		('Home Decor'),
		('Childcare'),
		('Moving'),
		('DeductIble Donation')
) as values(name)
on conflict (household_id, name) do nothing;
