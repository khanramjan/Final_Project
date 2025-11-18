// Add these routes to your React Router configuration

import ReportVolunteerForm from './components/Volunteer/ReportVolunteerForm';
import MyReportsAndWarnings from './pages/Volunteer/MyReportsAndWarnings';
import AdminVolunteerReports from './pages/Admin/AdminVolunteerReports';

// In your Routes component:

// Volunteer Routes (Protected)
<Route path="/volunteer/reports" element={<MyReportsAndWarnings />} />
<Route path="/volunteer/report/:volunteerId" element={<ReportVolunteerForm />} />

// Admin Routes (Protected - Admin Only)
<Route path="/admin/volunteer-reports" element={<AdminVolunteerReports />} />

// Example usage in a volunteer assignment or profile page:
/*
import { Link } from 'react-router-dom';

// Inside your component:
<Link 
  to={`/volunteer/report/${volunteerId}`}
  state={{ 
    reportedVolunteerId: volunteerId,
    reportedVolunteerName: volunteerName,
    campaignId: campaignId,
    assignmentId: assignmentId 
  }}
  className="text-red-600 hover:text-red-800"
>
  Report Volunteer
</Link>

// Or as a button that opens a modal:
<button onClick={() => setShowReportModal(true)}>
  Report Volunteer
</button>

{showReportModal && (
  <div className="modal">
    <ReportVolunteerForm
      reportedVolunteerId={volunteerId}
      reportedVolunteerName={volunteerName}
      campaignId={campaignId}
      assignmentId={assignmentId}
      onSuccess={() => setShowReportModal(false)}
      onCancel={() => setShowReportModal(false)}
    />
  </div>
)}
*/

// Add to Admin Sidebar Navigation:
/*
<Link to="/admin/volunteer-reports" className="nav-link">
  <svg className="icon" />
  Volunteer Reports
  {pendingReportsCount > 0 && (
    <span className="badge">{pendingReportsCount}</span>
  )}
</Link>
*/

// Add to Volunteer Dashboard Navigation:
/*
<Link to="/volunteer/reports" className="nav-link">
  <svg className="icon" />
  My Reports & Warnings
  {unacknowledgedWarningsCount > 0 && (
    <span className="badge-danger">{unacknowledgedWarningsCount}</span>
  )}
</Link>
*/
