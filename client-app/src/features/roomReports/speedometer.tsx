import { Cell, Pie, PieChart } from "recharts";

interface DataRow{
    name: string
    value: number
    color: string
}



const RADIAN = Math.PI / 180;
const data : DataRow[] = [
  { name: 'A', value: 25, color: '#ff0000' },
  { name: 'B', value: 50, color: '#ffa500' },
  { name: 'C', value: 25, color: '#008000' },
];


const cx = 150;
const cy = 200;
const iR = 50;
const oR = 100;
const value = 50; 

const needle = (
    percentage : number, data: DataRow[], cx: number, cy: number, iR: number, oR: number, color: string
    ) => {
      if(percentage > 99) percentage = 96;
      if(percentage < 5) percentage = 5;
        const ang = 180.0 * (1 - percentage / 100);
    const length = (iR + 2 * oR) / 3;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const r = 5;
    const x0 = cx + 5;
    const y0 = cy + 5;
    const xba = x0 + r * sin;
    const yba = y0 - r * cos;
    const xbb = x0 - r * sin;
    const ybb = y0 + r * cos;
    const xp = x0 + length * cos;
    const yp = y0 + length * sin;
    return [
        <circle cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
        <path d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`} stroke="#none" fill={color} />,
      ];
    };

    interface Props {
        percentage: number;
    }

export default function Speedomter({percentage}: Props) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200' }}>
        <PieChart width={400} height={200}>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx={cx}
            cy={cy}
            innerRadius={iR}
            outerRadius={oR}
            fill="#8884d8"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {needle(percentage, data, cx, cy, iR, oR, '#d0d000')}
        </PieChart>
        </div>
      );
}