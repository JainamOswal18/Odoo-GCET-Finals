import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminLayout, PortalLayout } from "@/layouts";

// Auth Pages
import { Login, SignUp, CreateUser, ForgotPassword } from "@/pages/auth";

// Main Pages
import { Dashboard } from "@/pages/Dashboard";
import { Contacts } from "@/pages/master/Contacts";
import { Products } from "@/pages/master/Products";
import { AnalyticalAccounts } from "@/pages/master/AnalyticalAccounts";
import { AutoAnalytical } from "@/pages/master/AutoAnalytical";

// Placeholder components for routes not yet implemented
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="text-gray-500 mt-2">This page is under development</p>
    </div>
  </div>
);

// Master Data Pages (placeholders for now)
const Budgets = () => <Placeholder title="Budgets" />;

// Transaction Pages (placeholders for now)
const PurchaseOrders = () => <Placeholder title="Purchase Orders" />;
const VendorBills = () => <Placeholder title="Vendor Bills" />;
const SalesOrders = () => <Placeholder title="Sales Orders" />;
const CustomerInvoices = () => <Placeholder title="Customer Invoices" />;
const Payments = () => <Placeholder title="Payments" />;

// Report Pages (placeholders for now)
const BudgetDashboard = () => <Placeholder title="Budget Dashboard" />;
const BudgetActuals = () => <Placeholder title="Budget vs Actuals" />;
const Revisions = () => <Placeholder title="Revision History" />;

// Portal Pages (placeholders for now)
import { PortalDashboard } from "@/pages/portal/PortalDashboard";
const MyInvoices = () => <Placeholder title="My Invoices" />;
const MyOrders = () => <Placeholder title="My Orders" />;
const PortalPayments = () => <Placeholder title="Portal Payments" />;

// Settings
const Settings = () => <Placeholder title="Settings" />;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin Routes */}
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Master Data */}
            <Route path="master">
              <Route path="contacts" element={<Contacts />} />
              <Route path="products" element={<Products />} />
              <Route path="analytical-accounts" element={<AnalyticalAccounts />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="auto-analytical" element={<AutoAnalytical />} />
            </Route>

            {/* Transactions */}
            <Route path="transactions">
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="vendor-bills" element={<VendorBills />} />
              <Route path="sales-orders" element={<SalesOrders />} />
              <Route path="customer-invoices" element={<CustomerInvoices />} />
              <Route path="payments" element={<Payments />} />
            </Route>

            {/* Reports */}
            <Route path="reports">
              <Route path="budget-dashboard" element={<BudgetDashboard />} />
              <Route path="budget-actuals" element={<BudgetActuals />} />
              <Route path="revisions" element={<Revisions />} />
            </Route>

            {/* Settings */}
            <Route path="settings" element={<Settings />} />

            {/* Create User (Admin only) */}
            <Route path="create-user" element={<CreateUser />} />
          </Route>

          {/* Portal Routes */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalDashboard />} />
            <Route path="invoices" element={<MyInvoices />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="payments" element={<PortalPayments />} />
          </Route>

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
