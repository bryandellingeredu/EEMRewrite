import { observer } from "mobx-react-lite";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Form, FormField, FormGroup, Input, Label, Segment, SegmentGroup } from "semantic-ui-react";
import { useEffect, useState } from "react";
import { RoomReport } from "../../app/models/roomReport";
import agent from "../../app/api/agent";
import { useStore } from "../../app/stores/store";

interface BarChartDataRow {
  name: string;
  unused: number;
  used: number;
  usedPercentage: number;
}

const getColor = (percentage: number) => {
  if (percentage > 75) return '#ff0000'; // Red for high usage
  if (percentage > 50) return '#ffa500'; // Orange for medium usage
  if (percentage > 25) return '#8B8000'; // Yellow for low usage
  return '#008000'; // Green for very low usage
};

export default observer(function RoomUsageReport() {
  const { graphRoomStore } = useStore();
  const { loadingInitial, graphRooms, loadGraphRooms } = graphRoomStore;
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [roomReports, setRoomReports] = useState<RoomReport[]>([]);
  const [barChartData, setBarChartData] = useState<BarChartDataRow[]>([]);

  const handleStartDateChange = (start: Date | null) => {
    setStartDate(start);
  };
  const handleEndDateChange = (end: Date | null) => {
    setEndDate(end);
  };

  useEffect(() => {
    if (!graphRooms.length) loadGraphRooms();
    if (graphRooms.length && startDate && endDate && startDate <= endDate) {
      agent.RoomReports.list(startDate, endDate).then((response) => {
        setRoomReports(response);
        const bcData: BarChartDataRow[] = response.map((report) => {
          const room = graphRooms.find(x => x.emailAddress === report.scheduleId);
          if (!room) return null;
          const usedBlocks = report.availabilityView.split('').filter(char => char !== '0').length;
          const unusedBlocks = report.availabilityView.split('').filter(char => char === '0').length;
          const totalBlocks = usedBlocks + unusedBlocks;
          const usedPercentage = (usedBlocks / totalBlocks) * 100;
          return {
            name: room.displayName,
            unused: parseFloat((unusedBlocks / 4).toFixed(1)), // Convert 15-minute blocks to hours and round to 1 decimal
            used: parseFloat((usedBlocks / 4).toFixed(1)), // Convert 15-minute blocks to hours and round to 1 decimal
            usedPercentage,
          };
        }).filter(item => item !== null) as BarChartDataRow[]; // Remove null values
        bcData.sort((a, b) => b.used - a.used);
        setBarChartData(bcData);
      });
    }
  }, [startDate, endDate, graphRooms.length, loadGraphRooms]);

  return (
    <div>
      <h1>Room Usage Report in Hours</h1>
      <Form>
        <FormGroup>
          <FormField>
            <label>Start</label>
            <DatePicker
              selected={startDate}
              onChange={date => handleStartDateChange(date)}
              placeholderText="Select start date"
            />
          </FormField>
          <FormField>
            <label>End</label>
            <DatePicker
              selected={endDate}
              onChange={date => handleEndDateChange(date)}
              placeholderText="Select end date"
            />
          </FormField>
        </FormGroup>
      </Form>

     <span style={{fontSize: '1.5em', marginRight: '10px'}}>Legend:</span>
      <Label content='high usage > 75%' size='large' style={{backgroundColor: '#ff0000', color: 'white'}}/>
      <Label content='medium usage > 50%' size='large' style={{backgroundColor: '#ffa500', color: 'white'}}/>
      <Label content='low usage > 25%' size='large' style={{backgroundColor:'#8B8000', color: 'white'}}/>
      <Label content='very low usage > 25%' size='large' style={{backgroundColor: '#008000', color: 'white'}}/>
 

      {barChartData.length > 0 &&
        <BarChart
          width={1600}
          height={3000}
          data={barChartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" orientation="top"
           label={{ value: 'Hours', position: 'insideTopLeft', offset: 10 }}
           />
          <YAxis type="category" dataKey="name" width={500} />
          <Tooltip />
          <Legend />
          <Bar dataKey="used" stackId="a"> 
            {barChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.usedPercentage)} />
            ))}
          </Bar>
          <Bar dataKey="unused" stackId="a" fill="#82ca9d" />
        </BarChart>
      }
    </div>
  );
});
