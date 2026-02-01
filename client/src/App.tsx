import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminLayout, PortalLayout } from "@/layouts";

// Auth Pages
import { Login, SignUp, CreateUser, ForgotPassword } from "@/pages/auth";

// Main Pages
import { Dashboard } from "@/pages/Dashboard";

// Master Data Pages
import { Contacts } from "@/pages/master/Contacts";
import { Products } from "@/pages/master/Products";
import { AnalyticalAccounts } from "@/pages/master/AnalyticalAccounts";
import { AutoAnalytical } from "@/pages/master/AutoAnalytical";
import { Budgets } from "@/pages/master/Budgets";

// Transaction Pages
import { PurchaseOrders } from "@/pages/transactions/PurchaseOrders";
import { VendorBills } from "@/pages/transactions/VendorBills";
import { SalesOrders } from "@/pages/transactions/SalesOrders";
import { CustomerInvoices } from "@/pages/transactions/CustomerInvoices";
import { Payments } from "@/pages/transactions/Payments";

// Budget Monitoring Pages
import { BudgetOverview, BudgetVsActuals, RevisionHistory } from "@/pages/budget";

// Settings Page
import { Settings } from "@/pages/settings";

// Portal Pages
import { PortalDashboard } from "@/pages/portal/PortalDashboard";
import { MyInvoices } from "@/pages/portal/MyInvoices";
import { InvoiceDetail } from "@/pages/portal/InvoiceDetail";
import { MyOrders } from "@/pages/portal/MyOrders";

import { PortalPayments } from "@/pages/portal/PortalPayments";

// Placeholder components for routes not yet implemented
const _Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="text-gray-500 mt-2">This page is under development</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
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

            {/* Budget Monitoring - matches Sidebar navigation */}
            <Route path="budget-monitoring">
              <Route path="overview" element={<BudgetOverview />} />
              <Route path="budget-vs-actuals" element={<BudgetVsActuals />} />
              <Route path="revision-history" element={<RevisionHistory />} />
            </Route>

            {/* Settings */}
            <Route path="settings" element={<Settings />} />

            {/* Create User (Admin only) */}
            <Route path="create-user" element={<CreateUser />} />
          </Route>

          {/* Portal Routes */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<Navigate to="/portal/dashboard" replace />} />
            <Route path="dashboard" element={<PortalDashboard />} />
            <Route path="invoices" element={<MyInvoices />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />
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
