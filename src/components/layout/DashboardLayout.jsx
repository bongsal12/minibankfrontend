import { useNavigate, useLocation } from "react-router-dom";
import { BsBank2 } from "react-icons/bs";
import { FaAddressCard, FaUserGroup } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";
import { BiSolidReport } from "react-icons/bi";
import { RiAccountBoxLine } from "react-icons/ri";
import { AiOutlineAudit } from "react-icons/ai";

export default function DashboardLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation(); 
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = {
    admin: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: <MdDashboard size={22} />,
      },
      {
        label: "Branches",
        path: "/admin/branches",
        icon: <BsBank2 size={22} />,
      },
      {
        label: "Staff",
        path: "/admin/staff",
        icon: <FaUserGroup size={22} />,
      },
      {
        label: "Pending KYC",
        path: "/kyc/pending",
        icon: <FaAddressCard size={22} />,
      },
      {
        label: "Accounts",
        path: "/staff/accounts",
        icon: <RiAccountBoxLine size={22} />,
      },
      {
        label: "Transaction Report",
        path: "/admin/reports/transactions",
        icon: <BiSolidReport size={22} />,
      },
      {
        label: "Audit Logs",
        path: "/admin/audit-logs",
        icon: <AiOutlineAudit size={22} />,
      },
    ],

    staff: [
      {
        label: "Dashboard",
        path: "/staff/dashboard",
        icon: <MdDashboard size={22} />,
      },
      {
        label: "Pending KYC",
        path: "/kyc/pending",
        icon: <FaAddressCard size={22} />,
      },
      {
        label: "Accounts",
        path: "/staff/accounts",
        icon: <RiAccountBoxLine size={22} />,
      },
      {
        label: "Transaction Report",
        path: "/admin/reports/transactions",
        icon: <BiSolidReport size={22} />,
      },
    ],

    customer: [
      {
        label: "Dashboard",
        path: "/customer/dashboard",
        icon: <MdDashboard size={22} />,
      },
      {
        label: "Transfer",
        path: "/customer/transfer",
        icon: <BsBank2 size={22} />,
      },
      {
        label: "Transactions",
        path: "/customer/transactions",
        icon: <FaAddressCard size={22} />,
      },
    ],
  };

  const currentMenuItems = menuItems[user?.role] || [];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 text-white bg-slate-900 md:block">
        <div className="p-6 text-2xl font-bold border-b border-slate-800">
          MiniBank
        </div>

        <nav className="p-4 space-y-2">
          {currentMenuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-2 px-4 py-2 text-left rounded-lg transition-colors hover:bg-blue-700 ${
                  isActive ? "bg-blue-700 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-right">
              <div className="font-medium text-slate-900">{user?.name}</div>
              <div className="capitalize text-slate-500">{user?.role}</div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-white transition-colors bg-red-500 rounded-lg cursor-pointer hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}