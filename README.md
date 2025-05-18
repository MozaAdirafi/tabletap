# TableTap

TableTap is a modern restaurant management and ordering platform built with [Next.js](https://nextjs.org). It allows restaurant owners to manage menus, categories, and tables (QR codes), while customers can browse menus, add items to their cart, and place orders—all in real time.

---

## 🚀 Getting Started

### 1. **Install Dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. **Run the Development Server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open http://localhost:3000 in your browser to see the app.


📝 Features
Restaurant Owner Dashboard: Manage menu categories, menu items, and tables (QR codes).
Menu Management: Add, edit, and remove menu items and categories.
QR Code Table Management: Generate and manage QR codes for tables.
Customer Mode: Customers can scan a QR code, browse the menu, add/remove items from their cart, and place orders.
Order Management: Real-time order tracking and status updates for both owners and customers.
Persistent Cart: Cart items are saved per user and device.
Authentication: Separate flows for restaurant owners and customers.
<br><br>
🧑‍💻 Project Structure
src/app/ - Main Next.js app directory (pages, layouts, API routes)
src/components/ - Reusable UI and feature components
src/lib/ - Firebase, context, hooks, and utility functions
<br><br>

🧪 User Flow (Demo/Test Instructions)
1. Register as a Restaurant Owner
Go to the registration page.
Create a new account (e.g., dummy.owner@example.com / DummyPass123!).
Log in as the restaurant owner.
2. Set Up Restaurant
(If prompted) Enter a restaurant name, e.g., TableTap Bistro.
3. Add Menu Categories
Navigate to Menu Management.
Click + Add Category.
Add categories such as:
Chicken
Drinks
Desserts
4. Add Menu Items
In Menu Management, select a category (e.g., Chicken).
Click Add Menu Item.
Fill in the form with details, e.g.:
Name: Fried Chicken
Description: Crispy fried chicken thigh
Price: 5.99
Tags: Spicy, Popular
Available: Yes
Repeat for other items (e.g., Cola in Drinks, Chocolate Cake in Desserts).
5. Add Tables (QR Codes)
Go to QR Codes in the sidebar.
Add at least 2 tables (e.g., Table 1, Table 2).
(Optional) Download or view the QR codes.
6. Switch to Customer Mode
Click Customer Mode (top of dashboard or sidebar).
7. Simulate Customer Experience
Scan a QR code (or select a table if QR not required).
Browse the menu.
Add items to cart (e.g., Fried Chicken, Cola).
Remove items from cart if desired (test remove functionality).
Proceed to Checkout and place an order.
8. Order Management (Owner)
Switch back to Admin Mode (or log in as owner).
Go to Orders.
View the new order placed by the customer.
Change order status (e.g., Preparing, Ready, Delivered).
Optionally, delete or update orders.
9. Order Tracking (Customer)
As the customer, view the order status update in real time.
10. Settings & Logout
Test the Settings page (if available).
Log out as both owner and customer.

Notes
The app uses real-time updates (Firestore).
Menu/category changes and order status updates should reflect instantly.
Cart is persistent per user (localStorage).
Removing items from the cart is supported on the menu page.
All flows (owner and customer) can be tested in separate browser tabs or incognito windows.
