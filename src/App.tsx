import React, { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/common/Header';
import { BottomNav, NavigationTab } from './components/common/BottomNav';
import { HomeScreen } from './components/screens/HomeScreen';
import { TransactionsScreen } from './components/screens/TransactionsScreen';
import { UncategorizedScreen } from './components/screens/UncategorizedScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { BudgetScreen } from './components/screens/BudgetScreen';
import { AccountsScreen } from './components/screens/AccountsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { TestRunnerScreen } from './components/screens/TestRunnerScreen';
import { NativeCodeViewerScreen } from './components/screens/NativeCodeViewerScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { ManualEntryModal } from './components/screens/ManualEntryModal';
import { SmsSimulatorModal } from './components/sms/SmsSimulatorModal';
import { InteractiveNotificationToast } from './components/notifications/InteractiveNotificationToast';
import { ClipboardBottomSheet } from './components/sms/ClipboardBottomSheet';

export default function App() {
  const { state } = useAppStore();
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isSmsSimulatorOpen, setIsSmsSimulatorOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!state.settings.hasCompletedOnboarding);

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] antialiased selection:bg-blue-600 selection:text-white font-sans" dir="rtl">
      {/* Interactive Push Notification Floating Overlay (Notifee) */}
      <InteractiveNotificationToast />

      {/* iOS Clipboard Detection Bottom Sheet */}
      <ClipboardBottomSheet />

      {/* Main App Container */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col px-3 pt-2 relative">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenSmsSimulator={() => setIsSmsSimulatorOpen(true)}
          onOpenTestRunner={() => setActiveTab('testrunner')}
          onOpenNativeCode={() => setActiveTab('nativeCode')}
        />

        {/* Main Content Area */}
        <main className="flex-1 mt-2">
          {activeTab === 'home' && (
            <HomeScreen
              onChangeTab={setActiveTab}
              onOpenManualEntry={() => setIsManualEntryOpen(true)}
              onOpenSmsSimulator={() => setIsSmsSimulatorOpen(true)}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsScreen onOpenManualEntry={() => setIsManualEntryOpen(true)} />
          )}

          {activeTab === 'uncategorized' && (
            <UncategorizedScreen onBackToHome={() => setActiveTab('home')} />
          )}

          {activeTab === 'reports' && <ReportsScreen />}

          {activeTab === 'budget' && <BudgetScreen />}

          {activeTab === 'accounts' && <AccountsScreen />}

          {activeTab === 'settings' && <SettingsScreen />}

          {activeTab === 'testrunner' && <TestRunnerScreen />}

          {activeTab === 'nativeCode' && <NativeCodeViewerScreen />}
        </main>

        {/* Sophisticated Dark Bottom Navigation with Raised Center Action Button */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOpenManualEntry={() => setIsManualEntryOpen(true)}
        />
      </div>

      {/* Quick 3-Second Manual Entry Modal */}
      <ManualEntryModal
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
      />

      {/* Bank SMS Sandbox Simulator Modal */}
      <SmsSimulatorModal
        isOpen={isSmsSimulatorOpen}
        onClose={() => setIsSmsSimulatorOpen(false)}
      />
    </div>
  );
}
