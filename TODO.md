# TODO - Food Donation App Updates

## Task 1: Display available donations in tabulated form with donor names

### Steps:
1. [x] Read and understand the current implementation
2. [x] Update GetFood/page.tsx to display donations in a table format
3. [x] Ensure donor names are properly displayed instead of "Anonymous"
4. [x] Add CSS styling for the table

## Changes Made:
1. **Converted list to table**: Replaced `<ul><li>` structure with an HTML `<table>` element
2. **Columns**: Donor Name, Food Type, Quantity, Location
3. **Donor name display**: Improved the conditional check to properly display the donor's name or fall back to "Anonymous"
4. **Added CSS**: Styled the table with proper colors, borders, and hover effects
5. **Responsive design**: Added overflow-x for mobile devices

---

## Task 2: Logout should redirect to home page

### Steps:
1. [x] Import useRouter from next/navigation
2. [x] Initialize router in the component
3. [x] Add router.push('/') to handleLogout function

### Files Edited:
- `food-donation-app/app/GetFood/page.tsx`
- `food-donation-app/app/GetFood/style.css`
- `food-donation-app/app/components/Navbar.tsx`

