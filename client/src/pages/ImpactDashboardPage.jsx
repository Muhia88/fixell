import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';
import { DollarSign, Package, Recycle, Wrench, Badge, Trash2 } from 'lucide-react'; 

const StatCard = ({ title, value, unit, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800">
                {/* Format KES with commas */}
                {unit === 'KES' ? value.toLocaleString('en-KE') : value}
                <span className="text-lg font-medium ml-1">{unit}</span>
            </p>
        </div>
    </div>
);

const ImpactBarChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-sm text-gray-500">No category data yet. Start listing items!</p>;
    }
    const maxValue = Math.max(...data.map(d => d.value), 1); 
    
    const maxBarHeightRem = 9.5;

    return (
        <div className="flex items-end space-x-4 h-48">
            {data.map(item => (
                <div key={item.name} className="flex-1 flex flex-col items-center">
                    <div className="text-lg font-semibold text-gray-700">{item.value}</div>
                    <div
                        className="w-full bg-green-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${(item.value / maxValue) * maxBarHeightRem}rem` }}
                        title={`${item.name}: ${item.value} items`}
                    ></div>
                    <div className="text-xs font-medium text-gray-500 mt-2">{item.name}</div>
                </div>
            ))}
        </div>
    );
};


const ActivityItem = ({ icon: Icon, text, time, color }) => (
    <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
            {Icon && <Icon className="w-4 h-4 text-white" />}
        </div>
        <div className="flex-1">
            <p className="text-sm text-gray-700">{text}</p>
            <p className="text-xs text-gray-500">{time}</p>
        </div>
    </div>
);


const ImpactDashboardPage = () => {
    const { user } = useAuth();
    const [impact, setImpact] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
        
                const [impactRes, activityRes] = await Promise.all([
                    api.get('/users/impact'),
                    api.get('/users/activity')
                ]);

                if (impactRes.data?.success) {
                    setImpact(impactRes.data);
                } else {
                    throw new Error(impactRes.data?.message || 'Failed to load impact stats');
                }

                if (activityRes.data?.success) {
                    setActivity(activityRes.data.activity || []);
                } else {
                    throw new Error(activityRes.data?.message || 'Failed to load activity');
                }

            } catch (err) {
                setError(err.message);
                console.error("Failed to load dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatTimeAgo = (isoDate) => {
        const date = new Date(isoDate);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const getActivityDetails = (event) => {
        switch (event.event_type) {
            case 'ITEM_LISTED':
                return {
                    icon: Package,
                    text: event.description || 'You listed an item for sale.',
                    color: 'bg-blue-500'
                };
            case 'GUIDE_SAVED':
                return {
                    icon: Wrench,
                    text: event.description || 'You saved a repair guide.',
                    color: 'bg-teal-500'
                };
            default:
                return {
                    icon: Badge,
                    text: event.description || 'You made an impact!',
                    color: 'bg-gray-500'
                };
        }
    };

    if (loading) {
        return <div className="text-gray-600">Loading your impact...</div>;
    }

    if (error) {
        return <div className="text-red-600">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 text-left">
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.name?.split(' ')[0] || 'Alex'}!
                </h1>
                <p className="text-gray-600 mt-1">See the amazing impact you've made.</p>

                {/* Stats Cards */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <StatCard
                        title="Items Saved from Landfill"
                        value={impact?.stats?.items_saved || 0}
                        unit=""
                        icon={Recycle}
                        color="bg-green-500"
                    />
                    <StatCard
                        title="Waste Diverted from Landfill"
                        value={impact?.stats?.weight_diverted || 0}
                        unit="kg"
                        icon={Trash2}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Money Saved"
                        value={impact?.stats?.money_saved || 0}
                        unit="KES"
                        icon={DollarSign}
                        color="bg-yellow-500"
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    {/* Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Impact by Category</h2>
                            <span className="text-sm font-medium text-gray-500">All Time</span>
                        </div>
                        <ImpactBarChart data={impact?.by_category || []} />
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            {activity.length > 0 ? (
                                activity.map(event => {
                                    const { icon, text, color } = getActivityDetails(event);
                                    return (
                                        <ActivityItem
                                            key={event.id}
                                            icon={icon}
                                            text={text}
                                            time={formatTimeAgo(event.created_at)}
                                            color={color}
                                        />
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-500">
                                    Your recent activity will appear here once you list an item or save a guide.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImpactDashboardPage;