"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const statusData = [
  { name: "Completed", value: 70, color: "#16805b" },
  { name: "In progress", value: 30, color: "#e19a32" },
  { name: "Overdue", value: 20, color: "#c94b37" },
];
const trendData = [
  { month: "Mar", resolved: 8 }, { month: "Apr", resolved: 14 }, { month: "May", resolved: 19 },
  { month: "Jun", resolved: 31 }, { month: "Jul", resolved: 45 }, { month: "Aug", resolved: 70 },
];
const categoryData = [
  { name: "Entrance", issues: 34 }, { name: "Movement", issues: 27 }, { name: "Toilets", issues: 23 },
  { name: "Parking", issues: 19 }, { name: "Signs", issues: 17 },
];

const tooltipStyle = { borderRadius: 12, border: "1px solid #dfe6e1", boxShadow: "0 12px 28px rgba(20,45,34,.1)", fontSize: 12 };

export function StatusDonut() {
  return <div className="h-[240px] w-full"><ResponsiveContainer><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3}>{statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer><div className="-mt-[141px] text-center"><p className="text-3xl font-black">120</p><p className="text-xs text-[#748078]">total issues</p></div></div>;
}

export function ResolutionTrend() {
  return <div className="h-[240px] w-full"><ResponsiveContainer><LineChart data={trendData} margin={{ top: 15, right: 10, bottom: 0, left: -25 }}><CartesianGrid stroke="#edf0ee" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} /><YAxis tickLine={false} axisLine={false} fontSize={11} /><Tooltip contentStyle={tooltipStyle} /><Line type="monotone" dataKey="resolved" stroke="#0b5d45" strokeWidth={3} dot={{ fill: "#e15f2a", strokeWidth: 0, r: 4 }} /></LineChart></ResponsiveContainer></div>;
}

export function CategoryBars() {
  return <div className="h-[240px] w-full"><ResponsiveContainer><BarChart data={categoryData} layout="vertical" margin={{ top: 8, right: 15, bottom: 0, left: 5 }}><CartesianGrid stroke="#edf0ee" horizontal={false} /><XAxis type="number" hide /><YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={65} fontSize={11} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="issues" fill="#e15f2a" radius={[0, 6, 6, 0]} barSize={16} /></BarChart></ResponsiveContainer></div>;
}
