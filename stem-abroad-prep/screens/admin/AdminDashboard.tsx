import React, { useState } from 'react';
import { AdminTab } from './types';
import { BlobDecor } from './components/SharedUI';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import DashboardOverview from './tabs/DashboardOverview';
import UserManagement from './tabs/UserManagement';
import UserEditModal from './tabs/UserEditModal';
import AIAgentManagement from './tabs/AIAgentManagement';
import AITokenMonitor from './tabs/AITokenMonitor';
import AIConfigPanel from './tabs/AIConfigPanel';
import ChatManagement from './tabs/ChatManagement';
import ContentModeration from './tabs/ContentModeration';
import Analytics from './tabs/Analytics';
import SystemSettings from './tabs/SystemSettings';
import SystemLogs from './tabs/SystemLogs';
import RBACManagement from './tabs/RBACManagement';
import Communication from './tabs/Communication';
import SupportTools from './tabs/SupportTools';
import DataExchange from './tabs/DataExchange';
import ResourceManagement from './tabs/ResourceManagement';
import FeatureFlags from './tabs/FeatureFlags';
import IntegrationManagement from './tabs/IntegrationManagement';
import BillingManagement from './tabs/BillingManagement';
import InfraMonitoring from './tabs/InfraMonitoring';
import DataPrivacy from './tabs/DataPrivacy';

interface Props {
  onBack: () => void;
  onSwitchToUser?: () => void;
  userName?: string;
  userEmail?: string;
}

export default function AdminDashboard({ onBack, onSwitchToUser, userName = 'Admin', userEmail = 'admin@nextstem.org' }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  const navigateToEdit = (id: string) => { setEditUserId(id); setActiveTab('user-edit'); };
  const backFromEdit = () => { setEditUserId(null); setActiveTab('users'); };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      <BlobDecor />
      <AdminSidebar
        activeTab={activeTab} setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
        userName={userName} userEmail={userEmail} onLogout={onBack}
        onSwitchToUser={onSwitchToUser}
      />
      <div className="lg:ml-[260px] flex flex-col min-h-screen">
        <AdminHeader activeTab={activeTab} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-4 md:p-8">{renderTab()}</main>
      </div>
    </div>
  );

  function renderTab() {
    switch (activeTab) {
      case 'overview': return <DashboardOverview />;
      case 'users': return <UserManagement onEditUser={navigateToEdit} />;
      case 'user-edit': return <UserEditModal userId={editUserId} onBack={backFromEdit} />;
      case 'ai-config': return <AIConfigPanel />;
      case 'ai-agents': return <AIAgentManagement />;
      case 'ai-tokens': return <AITokenMonitor />;
      case 'chat-mgmt': return <ChatManagement />;
      case 'moderation': return <ContentModeration />;
      case 'analytics': return <Analytics />;
      case 'settings': return <SystemSettings />;
      case 'logs': return <SystemLogs />;
      case 'rbac': return <RBACManagement />;
      case 'communication': return <Communication />;
      case 'support': return <SupportTools />;
      case 'data-exchange': return <DataExchange />;
      case 'resources': return <ResourceManagement />;
      case 'feature-flags': return <FeatureFlags />;
      case 'integrations': return <IntegrationManagement />;
      case 'billing': return <BillingManagement />;
      case 'infra': return <InfraMonitoring />;
      case 'privacy': return <DataPrivacy />;
      default: return <DashboardOverview />;
    }
  }
}
