import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface MiniPieChartProps {
    achieved: number;
    balance: number;
    size?: number;
    onClick?: () => void;
}

export const MiniPieChart: React.FC<MiniPieChartProps> = ({
    achieved,
    balance,
    size = 40,
    onClick,
}) => {
    const total = achieved + balance;
    
    // Handle case where there's no data
    if (total === 0) {
        return (
            <div 
                className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                style={{ width: size, height: size }}
                onClick={onClick}
            >
                <div 
                    className="rounded-full border-2 border-gray-300 bg-gray-100"
                    style={{ width: size - 8, height: size - 8 }}
                />
            </div>
        );
    }

    const data = [
        { name: "Achieved", value: achieved, color: "#06b6d4" },
        { name: "Balance", value: balance, color: "#ef4444" },
    ];

    return (
        <div 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            style={{ width: size, height: size }}
            onClick={onClick}
        >
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={size / 5}
                        outerRadius={size / 2.5}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
