import { useState } from "react";
import { Clock, User, TrendingUp, TrendingDown, Search, Filter } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { MOCK_ANALYTICAL_ACCOUNTS } from "@/lib/mock";

interface BudgetRevision {
    id: string;
    timestamp: string;
    account: string;
    changedBy: string;
    changeType: "increase" | "decrease" | "reallocation" | "adjustment";
    previousAmount: number;
    newAmount: number;
    difference: number;
    reason: string;
    approvedBy?: string;
    status: "approved" | "pending" | "rejected";
}

// Mock revision data
const MOCK_REVISIONS: BudgetRevision[] = [
    {
        id: "1",
        timestamp: "2024-01-28 14:30:00",
        account: "Marketing & Sales",
        changedBy: "John Doe",
        changeType: "increase",
        previousAmount: 200000,
        newAmount: 250000,
        difference: 50000,
        reason: "Additional campaign budget required for Q1 product launch",
        approvedBy: "Jane Smith (CFO)",
        status: "approved",
    },
    {
        id: "2",
        timestamp: "2024-01-25 10:15:00",
        account: "IT Infrastructure",
        changedBy: "Mike Johnson",
        changeType: "reallocation",
        previousAmount: 300000,
        newAmount: 350000,
        difference: 50000,
        reason: "Cloud infrastructure upgrade to handle increased traffic",
        approvedBy: "Jane Smith (CFO)",
        status: "approved",
    },
    {
        id: "3",
        timestamp: "2024-01-22 16:45:00",
        account: "Office Supplies",
        changedBy: "Sarah Williams",
        changeType: "decrease",
        previousAmount: 50000,
        newAmount: 35000,
        difference: -15000,
        reason: "Cost optimization - negotiated better supplier rates",
        approvedBy: "Jane Smith (CFO)",
        status: "approved",
    },
    {
        id: "4",
        timestamp: "2024-01-20 09:00:00",
        account: "R&D Department",
        changedBy: "David Brown",
        changeType: "increase",
        previousAmount: 500000,
        newAmount: 550000,
        difference: 50000,
        reason: "New research project approved by board of directors",
        status: "pending",
    },
    {
        id: "5",
        timestamp: "2024-01-18 13:20:00",
        account: "Employee Training",
        changedBy: "Emma Davis",
        changeType: "adjustment",
        previousAmount: 80000,
        newAmount: 75000,
        difference: -5000,
        reason: "Reduced training sessions due to lower headcount",
        approvedBy: "Jane Smith (CFO)",
        status: "approved",
    },
    {
        id: "6",
        timestamp: "2024-01-15 11:30:00",
        account: "Marketing & Sales",
        changedBy: "John Doe",
        changeType: "increase",
        previousAmount: 180000,
        newAmount: 200000,
        difference: 20000,
        reason: "Additional budget for social media advertising",
        approvedBy: "Jane Smith (CFO)",
        status: "approved",
    },
    {
        id: "7",
        timestamp: "2024-01-10 15:00:00",
        account: "IT Infrastructure",
        changedBy: "Mike Johnson",
        changeType: "decrease",
        previousAmount: 320000,
        newAmount: 300000,
        difference: -20000,
        reason: "Delayed server upgrade to next quarter",
        approvedBy: "Jane Smith (CFO)",
        status: "approved",
    },
    {
        id: "8",
        timestamp: "2024-01-08 10:45:00",
        account: "Office Supplies",
        changedBy: "Sarah Williams",
        changeType: "adjustment",
        previousAmount: 55000,
        newAmount: 50000,
        difference: -5000,
        reason: "Minor budget adjustment for stationery",
        approvedBy: "Jane Smith (CFO)",
        status: "approved",
    },
];

export default function RevisionHistory() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterAccount, setFilterAccount] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");

    // Filter revisions
    const filteredRevisions = MOCK_REVISIONS.filter((revision) => {
        const matchesSearch =
            revision.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
            revision.changedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
            revision.reason.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAccount = filterAccount === "all" || revision.account === filterAccount;
        const matchesStatus = filterStatus === "all" || revision.status === filterStatus;
        const matchesType = filterType === "all" || revision.changeType === filterType;

        return matchesSearch && matchesAccount && matchesStatus && matchesType;
    });

    const getChangeIcon = (type: string) => {
        switch (type) {
            case "increase":
                return <TrendingUp className="w-5 h-5 text-green-600" />;
            case "decrease":
                return <TrendingDown className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-blue-600" />;
        }
    };

    const getChangeBadge = (type: string) => {
        switch (type) {
            case "increase":
                return <Badge variant="success">Increase</Badge>;
            case "decrease":
                return <Badge variant="error">Decrease</Badge>;
            case "reallocation":
                return <Badge variant="info">Reallocation</Badge>;
            default:
                return <Badge variant="warning">Adjustment</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge variant="success">Approved</Badge>;
            case "pending":
                return <Badge variant="warning">Pending</Badge>;
            default:
                return <Badge variant="error">Rejected</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Revision History</h1>
                    <p className="text-gray-600 mt-1">Track all budget changes and modifications</p>
                </div>
                <Button className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    View Timeline
                </Button>
            </div>

            {/* Search and Filters */}
            <Card className="p-4">
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by account, user, or reason..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-gray-700">Filters:</span>
                        </div>
                        <select
                            value={filterAccount}
                            onChange={(e) => setFilterAccount(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Accounts</option>
                            {MOCK_ANALYTICAL_ACCOUNTS.map((acc) => (
                                <option key={acc.id} value={acc.name}>
                                    {acc.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Change Types</option>
                            <option value="increase">Increase</option>
                            <option value="decrease">Decrease</option>
                            <option value="reallocation">Reallocation</option>
                            <option value="adjustment">Adjustment</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <span className="ml-auto text-sm text-gray-600">
                            {filteredRevisions.length} {filteredRevisions.length === 1 ? "revision" : "revisions"} found
                        </span>
                    </div>
                </div>
            </Card>

            {/* Timeline View */}
            <div className="space-y-4">
                {filteredRevisions.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No revision history found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                    </Card>
                ) : (
                    filteredRevisions.map((revision, index) => (
                        <Card key={revision.id} className="p-6">
                            <div className="flex items-start gap-4">
                                {/* Timeline Icon */}
                                <div className="relative">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                        revision.changeType === "increase" ? "bg-green-100" :
                                        revision.changeType === "decrease" ? "bg-red-100" :
                                        "bg-blue-100"
                                    }`}>
                                        {getChangeIcon(revision.changeType)}
                                    </div>
                                    {index < filteredRevisions.length - 1 && (
                                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-300" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900">{revision.account}</h3>
                                                {getChangeBadge(revision.changeType)}
                                                {getStatusBadge(revision.status)}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    <span>Changed by: {revision.changedBy}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{revision.timestamp}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Before/After Comparison */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Previous Amount</p>
                                                <p className="text-lg font-semibold text-gray-700">
                                                    ₹{revision.previousAmount.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <div className={`px-4 py-2 rounded-lg font-medium ${
                                                    revision.difference > 0
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}>
                                                    {revision.difference > 0 ? "+" : ""}₹{revision.difference.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 mb-1">New Amount</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    ₹{revision.newAmount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-gray-700 mb-1">Reason for Change:</p>
                                        <p className="text-sm text-gray-600">{revision.reason}</p>
                                    </div>

                                    {/* Approval Info */}
                                    {revision.approvedBy && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Badge variant="success" className="text-xs">
                                                ✓ Approved
                                            </Badge>
                                            <span>by {revision.approvedBy}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
