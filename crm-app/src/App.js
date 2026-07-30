import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/common/ProtectedRoute';

// Dashboard
import Dashboard from './pages/Dashboard';

// Communication
import CommunicationHistory from './pages/communication/CommunicationHistory';
import Notes from './pages/communication/Notes';
import Attachments from './pages/communication/Attachments';
import RelationshipMapping from './pages/communication/RelationshipMapping';

// Leads
import LeadsList from './pages/leads/LeadsList';
import LeadDetail from './pages/leads/LeadDetail';
import LeadForm from './pages/leads/LeadForm';
import BulkImport from './pages/leads/BulkImport';
import DuplicateDetection from './pages/leads/DuplicateDetection';
import LeadAssignment from './pages/leads/LeadAssignment';
import LeadConversion from './pages/leads/LeadConversion';

// Contacts
import ContactsList from './pages/contacts/ContactsList';
import ContactDetail from './pages/contacts/ContactDetail';
import ContactForm from './pages/contacts/ContactForm';
import CustomerGroups from './pages/contacts/CustomerGroups';

// Accounts
import AccountsList from './pages/accounts/AccountsList';
import AccountDetail from './pages/accounts/AccountDetail';
import AccountForm from './pages/accounts/AccountForm';
import CompanyHierarchy from './pages/accounts/CompanyHierarchy';
import Companies from './pages/accounts/Companies';
import Branches from './pages/accounts/Branches';
import ParentCompanies from './pages/accounts/ParentCompanies';
import CustomerCategories from './pages/accounts/CustomerCategories';
import CreditLimits from './pages/accounts/CreditLimits';
import GSTDetails from './pages/accounts/GSTDetails';
import BillingAddress from './pages/accounts/BillingAddress';
import ShippingAddress from './pages/accounts/ShippingAddress';

// Opportunities
import OpportunitiesList from './pages/opportunities/OpportunitiesList';
import SalesPipeline from './pages/opportunities/SalesPipeline';
import OpportunityDetail from './pages/opportunities/OpportunityDetail';
import OpportunityForm from './pages/opportunities/OpportunityForm';
import OpportunityTracking from './pages/opportunities/OpportunityTracking';

// Activities
import ActivitiesCalendar from './pages/activities/ActivitiesCalendar';
import CallsList from './pages/activities/CallsList';
import MeetingsList from './pages/activities/MeetingsList';
import EmailsList from './pages/activities/EmailsList';
import FollowUpsList from './pages/activities/FollowUpsList';

// Campaigns
import CampaignsList from './pages/campaigns/CampaignsList';
import CampaignDetail from './pages/campaigns/CampaignDetail';
import EmailMarketing from './pages/campaigns/EmailMarketing';
import SMSCampaign from './pages/campaigns/SMSCampaign';
import WhatsAppCampaign from './pages/campaigns/WhatsAppCampaign';
import FacebookCampaign from './pages/campaigns/FacebookCampaign';
import GoogleCampaign from './pages/campaigns/GoogleCampaign';
import PushNotifications from './pages/campaigns/PushNotifications';

// Documents
import DocumentsList from './pages/documents/DocumentsList';
import DocumentDetail from './pages/documents/DocumentDetail';
import ProposalForm from './pages/documents/ProposalForm';
import QuotationForm from './pages/documents/QuotationForm';
import AgreementForm from './pages/documents/AgreementForm';
import OCRDocuments from './pages/documents/OCRDocuments';
import DigitalSignature from './pages/documents/DigitalSignature';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* All other routes are protected */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
        {/* Dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Communication */}
        <Route path="communication/history" element={<CommunicationHistory />} />
        <Route path="communication/notes" element={<Notes />} />
        <Route path="communication/attachments" element={<Attachments />} />
        <Route path="communication/relationships" element={<RelationshipMapping />} />

        {/* Leads */}
        <Route path="leads" element={<LeadsList />} />
        <Route path="leads/new" element={<LeadForm />} />
        <Route path="leads/tools/bulk-import" element={<BulkImport />} />
        <Route path="leads/tools/duplicate-detection" element={<DuplicateDetection />} />
        <Route path="leads/tools/assignment" element={<LeadAssignment />} />
        <Route path="leads/:id/convert" element={<LeadConversion />} />
        <Route path="leads/:id/edit" element={<LeadForm />} />
        <Route path="leads/:id" element={<LeadDetail />} />

        {/* Contacts */}
        <Route path="contacts" element={<ContactsList />} />
        <Route path="contacts/new" element={<ContactForm />} />
        <Route path="contacts/groups" element={<CustomerGroups />} />
        <Route path="contacts/:id/edit" element={<ContactForm />} />
        <Route path="contacts/:id" element={<ContactDetail />} />

        {/* Accounts – sub-modules first to avoid :id catching them */}
        <Route path="accounts/companies" element={<Companies />} />
        <Route path="accounts/branches" element={<Branches />} />
        <Route path="accounts/parent-companies" element={<ParentCompanies />} />
        <Route path="accounts/categories" element={<CustomerCategories />} />
        <Route path="accounts/credit-limits" element={<CreditLimits />} />
        <Route path="accounts/gst" element={<GSTDetails />} />
        <Route path="accounts/billing-address" element={<BillingAddress />} />
        <Route path="accounts/shipping-address" element={<ShippingAddress />} />
        <Route path="accounts/hierarchy" element={<CompanyHierarchy />} />
        <Route path="accounts/new" element={<AccountForm />} />
        <Route path="accounts/:id/edit" element={<AccountForm />} />
        <Route path="accounts/:id" element={<AccountDetail />} />
        <Route path="accounts" element={<AccountsList />} />

        {/* Opportunities */}
        <Route path="opportunities/tracking" element={<OpportunityTracking />} />
        <Route path="opportunities/pipeline" element={<SalesPipeline />} />
        <Route path="opportunities/new" element={<OpportunityForm />} />
        <Route path="opportunities/:id/edit" element={<OpportunityForm />} />
        <Route path="opportunities/:id" element={<OpportunityDetail />} />
        <Route path="opportunities" element={<OpportunitiesList />} />

        {/* Activities */}
        <Route path="activities" element={<ActivitiesCalendar />} />
        <Route path="activities/calls" element={<CallsList />} />
        <Route path="activities/meetings" element={<MeetingsList />} />
        <Route path="activities/emails" element={<EmailsList />} />
        <Route path="activities/followups" element={<FollowUpsList />} />

        {/* Campaigns */}
        <Route path="campaigns" element={<CampaignsList />} />
        <Route path="campaigns/email/new" element={<EmailMarketing />} />
        <Route path="campaigns/sms/new" element={<SMSCampaign />} />
        <Route path="campaigns/whatsapp/new" element={<WhatsAppCampaign />} />
        <Route path="campaigns/facebook/new" element={<FacebookCampaign />} />
        <Route path="campaigns/google/new" element={<GoogleCampaign />} />
        <Route path="campaigns/push/new" element={<PushNotifications />} />
        <Route path="campaigns/:id" element={<CampaignDetail />} />

        {/* Documents */}
        <Route path="documents/proposal/new" element={<ProposalForm />} />
        <Route path="documents/quotation/new" element={<QuotationForm />} />
        <Route path="documents/agreement/new" element={<AgreementForm />} />
        <Route path="documents/ocr" element={<OCRDocuments />} />
        <Route path="documents/signature" element={<DigitalSignature />} />
        <Route path="documents/:id" element={<DocumentDetail />} />
        <Route path="documents" element={<DocumentsList />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
