import React, { useEffect, useState } from 'react';
import { useUser } from '~/context/userContext';
import type { User } from '~/types/types';
import fetchUser from '~/apiCalls/fetchUser';
import accept from '~/apiCalls/user/accept';
import decline from '~/apiCalls/user/decline';
import disconnect from '~/apiCalls/user/disconnect';
import { UserXIcon } from 'lucide-react';
import Sidebar from '~/components/Sidebar';

const Connections = () => {
  const { user } = useUser();
  
  const [connectionUsers, setConnectionUsers] = useState<User[]>([]);
  const [requestReceivedUsers, setRequestReceivedUsers] = useState<User[]>([]);
  const [requestSentUsers, setRequestSentUsers] = useState<User[]>([]);

  const fetchConnections = async () => {
    if (user?.connections) {
      const fetchedUsers: User[] = [];
      for (const connection of user.connections) {
        const userData = await fetchUser(connection);
        fetchedUsers.push(userData);
      }
      setConnectionUsers(fetchedUsers);
    }
  };

  const fetchRequestsSent = async () => {
    if (user?.requestsSent) {
      const fetchedUsers: User[] = [];
      for (const request of user.requestsSent) {
        const userData = await fetchUser(request);
        fetchedUsers.push(userData);
      }
      setRequestSentUsers(fetchedUsers);
    }
  };

  const fetchRequestsReceived = async () => {
    if (user?.requestsReceived) {
      const fetchedUsers: User[] = [];
      for (const request of user.requestsReceived) {
        const userData = await fetchUser(request);
        fetchedUsers.push(userData);
      }
      setRequestReceivedUsers(fetchedUsers);
    }
  };

  const acceptConnection = async (userId: string) => {
    await accept(userId);
    // Refresh data after accepting
    fetchRequestsReceived();
    fetchConnections();
  };

  const declineConnection = async (userId: string) => {
    await decline(userId);
    // Remove from list after declining
    setRequestReceivedUsers((prev) => prev.filter(user => user._id !== userId));
  };

  const handleDisconnect = async (userId: string) => {
    await disconnect(userId);
    setConnectionUsers((prev) => prev.filter(user => user._id !== userId));
  };

  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchRequestsSent();
      fetchRequestsReceived();
    }
  }, [user]);

  return (
    <div className='min-h-screen bg-[#0a1118]'>
      <div className='flex flex-row gap-6 px-6 py-8 mx-auto max-w-[1400px]'>
        {/* Left Sidebar */}
        <Sidebar/>

        {/* Main Content Area */}
        <div className='flex-grow flex flex-col gap-6'>
          <h1 className='text-3xl font-bold text-white'>Connections</h1>

          {/* Connections List */}
          <div className='bg-[#0f1926] border border-[#1f2735] rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-white mb-4'>My Connections ({connectionUsers.length})</h2>
            <div className='flex flex-col gap-3'>
              {connectionUsers.length > 0 ? (
                connectionUsers.map((connection) => (
                  <div 
                    key={connection._id}
                    className='flex flex-row gap-5 justify-between items-center cursor-pointer p-4 border border-[#1f2735] rounded-lg hover:bg-[#121b2a] transition-colors'
                  >
                    <div 
                      className='flex gap-3 items-center flex-1' 
                      onClick={() => window.location.href = `/profile/${connection._id}`}
                    >
                      <img 
                        className="rounded-full border border-[#1f2735]" 
                        src={connection.picture} 
                        width={48} 
                        height={48}
                        alt={connection.name}
                      />
                      <div className='flex flex-col'>
                        <div className='text-white font-medium'>{connection.name}</div>
                        <div className='text-[#9aa4bd] text-sm'>{connection.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect(connection._id)}
                      className='p-2 hover:bg-[#1f2735] rounded-lg transition-colors'
                    >
                      <UserXIcon className='text-[#9aa4bd] hover:text-white' size={20} />
                    </button>
                  </div>
                ))
              ) : (
                <div className='text-[#9aa4bd] text-center py-8'>No connections</div>
              )}
            </div>
          </div>

          {/* Requests Section - Tabular Layout */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Requests Received */}
            <div className='bg-[#0f1926] border border-[#1f2735] rounded-lg p-6'>
              <h2 className='text-xl font-semibold text-white mb-4'>
                Requests Received ({requestReceivedUsers.length})
              </h2>
              <div className='flex flex-col gap-3'>
                {requestReceivedUsers.length > 0 ? (
                  requestReceivedUsers.map((requestUser) => (
                    <div 
                      key={requestUser._id}
                      className='p-4 border border-[#1f2735] rounded-lg hover:bg-[#121b2a] transition-colors'
                    >
                      <div className='flex items-center gap-3 mb-3'>
                        <img 
                          className="rounded-full border border-[#1f2735]" 
                          src={requestUser.picture} 
                          width={40} 
                          height={40}
                          alt={requestUser.name}
                        />
                        <div className='flex flex-col flex-1'>
                          <div className='text-white font-medium'>{requestUser.name}</div>
                          <div className='text-[#9aa4bd] text-sm'>{requestUser.email}</div>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <button 
                          className="flex-1 primary-btn py-2 rounded-lg" 
                          onClick={() => acceptConnection(requestUser._id)}
                        >
                          <span>ACCEPT</span>
                        </button>
                        <button 
                          className="flex-1 secondary-btn py-2 rounded-lg" 
                          onClick={() => declineConnection(requestUser._id)}
                        >
                          DECLINE
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-[#9aa4bd] text-center py-8'>No requests received</div>
                )}
              </div>
            </div>

            {/* Requests Sent */}
            <div className='bg-[#0f1926] border border-[#1f2735] rounded-lg p-6'>
              <h2 className='text-xl font-semibold text-white mb-4'>
                Requests Sent ({requestSentUsers.length})
              </h2>
              <div className='flex flex-col gap-3'>
                {requestSentUsers.length > 0 ? (
                  requestSentUsers.map((requestUser) => (
                    <div 
                      key={requestUser._id}
                      className='p-4 border border-[#1f2735] rounded-lg hover:bg-[#121b2a] transition-colors cursor-pointer'
                      onClick={() => window.location.href = `/profile/${requestUser._id}`}
                    >
                      <div className='flex items-center gap-3'>
                        <img 
                          className="rounded-full border border-[#1f2735]" 
                          src={requestUser.picture} 
                          width={40} 
                          height={40}
                          alt={requestUser.name}
                        />
                        <div className='flex flex-col flex-1'>
                          <div className='text-white font-medium'>{requestUser.name}</div>
                          <div className='text-[#9aa4bd] text-sm'>{requestUser.email}</div>
                        </div>
                        <div className='text-[#9aa4bd] text-xs'>Pending</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-[#9aa4bd] text-center py-8'>No requests sent</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connections;


