import { useAppSelector } from '../store/hooks';

const DEMO_EMAILS = [
  'demo.admin@donationmanagement.com',
  'demo.volunteer@donationmanagement.com',
];

/**
 * Sticky banner shown when a demo account is logged in.
 * Alerts the user that all write operations are disabled.
 */
const DemoBanner = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) return null;
  if (!DEMO_EMAILS.includes(user.email?.toLowerCase())) return null;

  const role = user.userType === 'admin' ? 'Admin' : 'Volunteer';

  return (
    <div
      role="alert"
      style={{
        background: 'linear-gradient(90deg, #b45309 0%, #d97706 50%, #b45309 100%)',
        color: '#fff',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontWeight: 600,
        fontSize: '0.875rem',
        letterSpacing: '0.01em',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        flexWrap: 'wrap',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>🔒</span>
      <span>
        You are viewing as a <strong>Demo {role}</strong> account.{' '}
        <span style={{ fontWeight: 400, opacity: 0.92 }}>
          All write operations (create / edit / delete) are disabled — explore freely without risk.
        </span>
      </span>
      <span
        style={{
          display: 'inline-block',
          background: 'rgba(255,255,255,0.18)',
          borderRadius: '9999px',
          padding: '2px 10px',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          border: '1px solid rgba(255,255,255,0.35)',
          whiteSpace: 'nowrap',
        }}
      >
        Read-Only Mode
      </span>
    </div>
  );
};

export default DemoBanner;
