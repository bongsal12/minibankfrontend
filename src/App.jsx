import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Branches from "./pages/admin/Branches";
import Staff from "./pages/admin/Staff";
import StaffDashboard from "./pages/staff/StaffDashboard";
import Register from "./pages/customer/Register";
import PendingApproval from "./pages/customer/PendingApproval";
import PendingKyc from "./pages/kyc/PendingKyc";
import KycReview from "./pages/kyc/KycReview";
import CustomerDashboard from "./pages/customer/CustomereDashboard";
import AccountDetail from "./pages/staff/AccountDetail";
import Accounts from "./pages/staff/Accounts";
import Transfer from "./pages/customer/Transfer";
import Transactions from "./pages/customer/Transactions";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TransactionReport from "./pages/admin/TransactionReport";
import AuditLogs from "./pages/admin/AuditLogs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="/customer/register" element={<Register />} />
        <Route path="/customer/pending" element={<PendingApproval />} />

        <Route
          path="/admin/branches"
          element={
            <ProtectedRoute role="admin">
              <Branches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute role="admin">
              <Staff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute role="staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kyc/pending"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <PendingKyc />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kyc/:id"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <KycReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports/transactions"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <TransactionReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute role="admin">
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/accounts"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <Accounts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/accounts/:id"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <AccountDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute role="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/transfer"
          element={
            <ProtectedRoute role="customer">
              <Transfer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/transactions"
          element={
            <ProtectedRoute role="customer">
              <Transactions />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
