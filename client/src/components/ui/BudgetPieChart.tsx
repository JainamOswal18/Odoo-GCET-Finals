import React from "react";
import { LabelList, Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Modal } from "./Modal";

interface BudgetPieChartProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    budgetName: string;
    achieved: number;
    balance: number;
}

// Configure the size increase between each pie ring
const BASE_RADIUS = 60;
const SIZE_INCREMENT = 25;

export const BudgetPieChart: React.FC<BudgetPieChartProps> = ({
    open,
    onOpenChange,
    budgetName,
    achieved,
    balance,
}) => {
    const total = achieved + balance;
    const achievedPercent = total > 0 ? ((achieved / total) * 100).toFixed(1) : "0";
    const balancePercent = total > 0 ? ((balance / total) * 100).toFixed(1) : "0";

    // Chart data - sorted by value (smallest to largest for better visual)
    const chartData = [
        { name: "Balance", value: balance, fill: "#ef4444" },    // Red for balance
        { name: "Achieved", value: achieved, fill: "#06b6d4" },  // Cyan for achieved
    ].sort((a, b) => a.value - b.value);

    // Calculate angles for each slice
    const getAngles = (index: number) => {
        const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);
        if (totalValue === 0) return { start: 0, end: 0 };
        
        const startValue = chartData.slice(0, index).reduce((sum, d) => sum + d.value, 0);
        const endValue = chartData.slice(0, index + 1).reduce((sum, d) => sum + d.value, 0);
        
        return {
            start: (startValue / totalValue) * 360,
            end: (endValue / totalValue) * 360
        };
    };

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={budgetName}
            description="Budget Achievement Overview"
            size="md"
        >
            <div className="space-y-6">
                {/* Pie Chart */}
                <div className="h-72 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip
                                formatter={(value) => `₹${Number(value || 0).toLocaleString()}`}
                                contentStyle={{
                                    backgroundColor: "#1f2937",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "#fff",
                                }}
                            />
                            {chartData.map((entry, index) => {
                                const angles = getAngles(index);
                                return (
                                    <Pie
                                        key={`pie-${index}`}
                                        data={[entry]}
                                        innerRadius={35}
                                        outerRadius={BASE_RADIUS + index * SIZE_INCREMENT}
                                        dataKey="value"
                                        cornerRadius={6}
                                        startAngle={angles.start}
                                        endAngle={angles.end}
                                        stroke="#fff"
                                        strokeWidth={2}
                                    >
                                        <Cell fill={entry.fill} />
                                        <LabelList
                                            dataKey="value"
                                            stroke="none"
                                            fontSize={12}
                                            fontWeight={600}
                                            fill="#fff"
                                            formatter={(value: any) => `₹${(Number(value) / 1000).toFixed(0)}K`}
                                        />
                                    </Pie>
                                );
                            })}
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-cyan-500"></div>
                        <span className="text-sm font-medium text-gray-700">Achieved</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span className="text-sm font-medium text-gray-700">Balance</span>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 rounded bg-cyan-500"></div>
                            <span className="text-sm font-medium text-cyan-800">Achieved</span>
                        </div>
                        <p className="text-2xl font-bold text-cyan-700">₹{achieved.toLocaleString()}</p>
                        <p className="text-sm text-cyan-600">{achievedPercent}% of budget</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 rounded bg-red-500"></div>
                            <span className="text-sm font-medium text-red-800">Balance</span>
                        </div>
                        <p className="text-2xl font-bold text-red-700">₹{balance.toLocaleString()}</p>
                        <p className="text-sm text-red-600">{balancePercent}% remaining</p>
                    </div>
                </div>

                {/* Total */}
                <div className="bg-gray-100 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600">Total Budgeted Amount</p>
                    <p className="text-3xl font-bold text-gray-900">₹{total.toLocaleString()}</p>
                </div>
            </div>
        </Modal>
    );
};
