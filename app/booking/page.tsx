'use client';

export default function BookingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'Playfair Display', Georgia, serif",
      background: '#f9f6f1'
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 56px)',
          marginBottom: '1.5rem',
          color: '#1a1815'
        }}>
          Let's Talk About Your Results
        </h1>
        
        <p style={{
          fontSize: '18px',
          lineHeight: '1.7',
          color: '#655d52',
          marginBottom: '2.5rem'
        }}>
          You've done the deep work. You've been honest. Now let's turn that clarity into action.
        </p>

        <p style={{
          fontSize: '16px',
          color: '#B87333',
          marginBottom: '2rem',
          fontFamily: 'system-ui, sans-serif'
        }}>
          I've received your results and will reach out within 24 hours to schedule a call.
        </p>

        <div style={{
          padding: '2rem',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <p style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#655d52',
            fontFamily: 'system-ui, sans-serif'
          }}>
            In the meantime, review your report. Notice what resonates. Notice what makes you uncomfortable. Those are the places we'll focus.
          </p>
        </div>

        <a href="/" style={{
          display: 'inline-block',
          marginTop: '2rem',
          padding: '12px 32px',
          background: '#B87333',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'background 0.2s'
        }}>
          Return to Home
        </a>
      </div>
    </div>
  );
}