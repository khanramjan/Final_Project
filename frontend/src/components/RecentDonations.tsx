import { useAppSelector } from '../store/hooks';

const RecentDonations = () => {
  const donations = useAppSelector((state) => (state as any).donations);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Donations</h3>
      
      {donations.loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : donations.donations?.length > 0 ? (
        <div className="space-y-3">
          {donations.donations.slice(0, 5).map((donation: any) => (
            <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  {donation.isAnonymous ? 'Anonymous' : `${donation.donor?.firstName} ${donation.donor?.lastName}`}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(donation.donationDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">${donation.amount}</p>
                <p className="text-xs text-gray-500 capitalize">{donation.status}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No recent donations</p>
      )}
    </div>
  );
};

export default RecentDonations;
