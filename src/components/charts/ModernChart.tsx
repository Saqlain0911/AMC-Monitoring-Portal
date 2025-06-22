import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

interface ModernChartProps {
  type: "bar" | "line" | "pie" | "doughnut";
  data: ChartData;
  title: string;
  description?: string;
  height?: number;
  options?: any;
}

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "white",
      bodyColor: "white",
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
};

const ModernChart: React.FC<ModernChartProps> = ({
  type,
  data,
  title,
  description,
  height = 300,
  options = {},
}) => {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  const renderChart = () => {
    const props = {
      data,
      options: mergedOptions,
      height,
    };

    switch (type) {
      case "bar":
        return <Bar {...props} />;
      case "line":
        return <Line {...props} />;
      case "pie":
        return <Pie {...props} />;
      case "doughnut":
        return <Doughnut {...props} />;
      default:
        return <Bar {...props} />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>{renderChart()}</div>
      </CardContent>
    </Card>
  );
};

export default ModernChart;
