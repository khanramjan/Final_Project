import { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { CalendarDaysIcon, MapPinIcon, HeartIcon, ClockIcon } from '@heroicons/react/24/outline';

interface CampaignPosterProps {
  campaign: {
    id: number;
    title: string;
    description: string;
    [key: string]: unknown;
  };
  onClose: () => void;
}

export default function CampaignPoster({ campaign, onClose }: CampaignPosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const qrImageRef = useRef<HTMLImageElement>(null);
  const [qrReady, setQrReady] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Normalize campaign data
  const imagePath = (campaign.imagePath || campaign.imageUrl) as string;
  const targetAmount = (campaign.targetAmount || campaign.goalAmount) as number;
  const raisedAmount = (campaign.raisedAmount || campaign.currentAmount) as number;
  const startDate = campaign.startDate as string;
  const endDate = campaign.endDate as string;
  const category = campaign.category as string;
  const location = (campaign.location || '') as string;
  const isUrgent = campaign.isUrgent as boolean;
  const creatorName = (campaign.creatorName || campaign.createdBy) as string;
  const donationCount = (campaign.donationCount || campaign.donorCount || 0) as number;

  const progressPercentage = Math.min((raisedAmount / targetAmount) * 100, 100);
  const daysRemaining = calculateDaysLeft(endDate);
  const paymentUrl = `${window.location.origin}/donate/${campaign.id}`;

  function calculateDaysLeft(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  // Generate QR code on canvas
  useEffect(() => {
    if (qrCanvasRef.current) {
      console.log('Generating QR code for:', paymentUrl);
      QRCode.toCanvas(qrCanvasRef.current, paymentUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      }, (error: Error | null | undefined) => {
        if (error) {
          console.error('Error generating QR code:', error);
          // Try fallback method
          QRCode.toDataURL(paymentUrl, {
            width: 200,
            color: {
              dark: '#1e40af',
              light: '#ffffff'
            }
          }, (err: Error | null | undefined, url: string) => {
            if (!err) {
              setQrDataUrl(url);
              if (qrCanvasRef.current) {
                const ctx = qrCanvasRef.current.getContext('2d');
                const img = new Image();
                img.onload = () => {
                  if (qrCanvasRef.current) {
                    qrCanvasRef.current.width = 200;
                    qrCanvasRef.current.height = 200;
                    ctx?.drawImage(img, 0, 0);
                    setQrReady(true);
                  }
                };
                img.src = url;
              }
            }
          });
        } else {
          console.log('QR code generated successfully');
          // Convert canvas to data URL for download/print
          if (qrCanvasRef.current) {
            const dataUrl = qrCanvasRef.current.toDataURL('image/png');
            setQrDataUrl(dataUrl);
          }
          setQrReady(true);
        }
      });
    }
  }, [paymentUrl]);

  const handlePrint = async () => {
    if (!posterRef.current || !qrReady) {
      alert('Please wait for the QR code to load...');
      return;
    }

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print - ${campaign.title}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                img { max-width: 100%; height: auto; }
                @media print { body { margin: 0; } img { width: 100%; page-break-inside: avoid; } }
              </style>
            </head>
            <body><img src="${imgData}" /></body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 1000);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate poster. Please try again.');
    }
  };

  const handleDownload = async () => {
    if (!posterRef.current || !qrReady) {
      alert('Please wait for the QR code to load...');
      return;
    }

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${campaign.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-poster.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to download poster.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white px-6 py-4 flex items-center justify-between z-10 rounded-t-lg">
          <h2 className="text-2xl font-bold">Campaign Poster</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-b flex flex-wrap gap-3 justify-end">
          <button
            onClick={handleDownload}
            disabled={!qrReady}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              qrReady 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Poster
          </button>
          <button
            onClick={handlePrint}
            disabled={!qrReady}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              qrReady 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Poster
          </button>
        </div>

        {/* Poster Preview */}
        <div className="p-6 bg-gray-100">
          <div 
            ref={posterRef}
            className="bg-white mx-auto shadow-xl"
            style={{ width: '794px', maxWidth: '100%' }}
          >
            {/* Gradient Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              padding: '40px 30px',
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'inline-block',
                background: 'rgba(255,255,255,0.25)',
                padding: '8px 24px',
                borderRadius: '25px',
                marginBottom: '16px'
              }}>
                <span style={{ 
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px'
                }}>
                  {category}
                </span>
              </div>
              
              <h1 style={{ 
                fontSize: '48px',
                fontWeight: '900',
                color: 'white',
                margin: '0 0 16px 0',
                lineHeight: '1.1',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                padding: '0 20px'
              }}>
                {campaign.title}
              </h1>
              
              {isUrgent && (
                <div style={{ 
                  display: 'inline-block',
                  background: '#dc2626',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  🚨 URGENT CAMPAIGN
                </div>
              )}
            </div>

            {/* Campaign Image */}
            {imagePath && (
              <div style={{ padding: '0 40px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '100%', 
                  height: '280px', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}>
                  <img
                    src={imagePath}
                    alt={campaign.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Main Content */}
            <div style={{ padding: '0 40px 40px 40px' }}>
              {/* Progress Section */}
              <div style={{ 
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '3px solid #3b82f6',
                borderRadius: '20px',
                padding: '30px',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '56px', fontWeight: '900', color: '#1e40af', marginBottom: '10px' }}>
                  {formatCurrency(raisedAmount)}
                </div>
                <div style={{ fontSize: '20px', color: '#64748b', marginBottom: '20px', fontWeight: '500' }}>
                  raised of {formatCurrency(targetAmount)} goal
                </div>
                
                {/* Progress Bar */}
                <div style={{ 
                  width: '100%',
                  height: '28px',
                  background: '#e2e8f0',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  marginBottom: '16px'
                }}>
                  <div style={{ 
                    height: '100%',
                    width: `${progressPercentage}%`,
                    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {progressPercentage > 12 && (
                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                        {progressPercentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HeartIcon style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                    <span style={{ fontWeight: '600', color: '#475569' }}>{donationCount} donors</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClockIcon style={{ width: '24px', height: '24px', color: '#f97316' }} />
                    <span style={{ fontWeight: '600', color: '#475569' }}>{daysRemaining} days left</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>
                  About This Campaign
                </h2>
                <p style={{ 
                  fontSize: '16px',
                  color: '#475569',
                  lineHeight: '1.7',
                  maxHeight: '120px',
                  overflow: 'hidden'
                }}>
                  {campaign.description}
                </p>
              </div>

              {/* Campaign Details */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: location ? '1fr 1fr' : '1fr',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div style={{ display: 'flex', gap: '12px', background: '#f8fafc', borderRadius: '16px', padding: '20px' }}>
                  <CalendarDaysIcon style={{ width: '32px', height: '32px', color: '#3b82f6', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '16px', marginBottom: '6px' }}>
                      Campaign Period
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      {formatDate(startDate)} - {formatDate(endDate)}
                    </div>
                  </div>
                </div>

                {location && (
                  <div style={{ display: 'flex', gap: '12px', background: '#f8fafc', borderRadius: '16px', padding: '20px' }}>
                    <MapPinIcon style={{ width: '32px', height: '32px', color: '#ef4444', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '16px', marginBottom: '6px' }}>
                        Location
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>{location}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Section */}
              <div style={{ 
                border: '4px dashed #a78bfa',
                borderRadius: '20px',
                padding: '30px',
                background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                textAlign: 'center'
              }}>
                <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', marginBottom: '10px' }}>
                   Scan to Donate Now!
                </h2>
                <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '24px', fontWeight: '500' }}>
                  Use your phone camera to scan & donate instantly
                </p>
                
                {/* QR Code Canvas */}
                <div style={{ 
                  display: 'inline-block',
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  border: '3px solid #e2e8f0',
                  position: 'relative'
                }}>
                  {/* Hidden canvas for QR generation */}
                  <canvas 
                    ref={qrCanvasRef} 
                    style={{ display: 'none' }}
                  />
                  {/* Visible image for display and capture */}
                  {qrDataUrl ? (
                    <img 
                      ref={qrImageRef}
                      src={qrDataUrl} 
                      alt="QR Code"
                      style={{ display: 'block', width: '200px', height: '200px' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '200px',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: '#64748b'
                    }}>
                      Generating QR Code...
                    </div>
                  )}
                </div>

                <div style={{ 
                  marginTop: '20px',
                  fontSize: '13px',
                  color: '#64748b',
                  background: 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  wordBreak: 'break-all'
                }}>
                  {paymentUrl}
                </div>
              </div>

              {/* Footer */}
              <div style={{ 
                marginTop: '30px',
                paddingTop: '24px',
                borderTop: '3px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>
                  Organized by <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{creatorName}</span>
                </p>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                  Donation Management System | Making a Difference Together
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center rounded-b-2xl">
          <div className="text-sm text-gray-600">
            {!qrReady && '⏳ Loading QR code...'}
            {qrReady && '✅ Poster ready to print/download'}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


