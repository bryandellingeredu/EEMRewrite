import { observer } from "mobx-react-lite";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Divider, Form, FormField, FormGroup, Header, Icon, Input, Label, Message, Segment, SegmentGroup } from "semantic-ui-react";
import { useEffect, useState } from "react";
import { RoomReport } from "../../app/models/roomReport";
import agent from "../../app/api/agent";
import { useStore } from "../../app/stores/store";
import RoomUsageReportDetailModal from "./roomUsageReportDetailModal";

interface BarChartDataRow {
  name: string;
  unused: number;
  used: number;
  usedPercentage: number;
}

interface BuildingCategory{
  id: number
  isSelected: boolean
  title: string
  color: string
}



const getColor = (percentage: number) => {
  if (percentage > 75) return '#008000'; // Green for high usage
  if (percentage > 25) return '#ffa500'; // Yellow for medium usage
  return '#ff0000';// Red for  low usage
};

export default observer(function RoomUsageReport() {
  const { graphRoomStore } = useStore();
  const { modalStore } = useStore();
  const { loadingInitial, graphRooms, loadGraphRooms } = graphRoomStore;
  const {openModal, closeModal} = modalStore;
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [roomReports, setRoomReports] = useState<RoomReport[]>([]);
  const [barChartData, setBarChartData] = useState<BarChartDataRow[]>([]);
  const [buildingCategories, setBuildingCategories] = useState<BuildingCategory[]>(
    [
      { id: 1, isSelected: true, title: 'Show All', color: '#00008B' },
      { id: 2, isSelected: false, title: 'Bldg 22', color: '#8A3324' },
      { id: 3, isSelected: false, title: 'Bldg 46', color: '#C2B280' },
      { id: 4, isSelected: false, title: 'Bldg 47', color: '#FF8C00' },
      { id: 5, isSelected: false, title: 'Bldg 314', color: '#301934' },
      { id: 6, isSelected: false, title: 'Bldg 315', color: '#E75480' },
      { id: 7, isSelected: false, title: 'Bldg 632', color: '#8B0000' },
      { id: 8, isSelected: false, title: 'Bldg 650', color: '#006400' },
      { id: 9, isSelected: false, title: 'Bldg 651', color: '#1a1a1a' },
      { id: 10, isSelected: false, title: 'Bldg 950', color: '#014d4e' },
    ]
  )
  
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
        }).filter(item => item !== null) as BarChartDataRow[];
        bcData.sort((a, b) => b.used - a.used);
        
        const showAllSelected = buildingCategories.find(category => category.id === 1)?.isSelected;
        if (!showAllSelected) {
          const selectedTitles = buildingCategories.filter(category => category.isSelected).map(category => category.title);
          const filteredData = bcData.filter(data => selectedTitles.some(title => data.name.startsWith(title)));
          setBarChartData(filteredData);
        } else {
          setBarChartData(bcData);
        }
      });
    }
  }, [startDate, endDate, graphRooms.length, loadGraphRooms, buildingCategories]);

  const handleBarClick = (data: BarChartDataRow) => {
    openModal(
      <RoomUsageReportDetailModal
       name={data.name}
       used={data.used}
       unused={data.unused}
       start={startDate || new Date()}
       end={endDate || new Date()}
       />, 'large'
     )
    
  };

  const handleLabelClick = (buildingCategory: BuildingCategory) => {
    setBuildingCategories(prevCategories => {
      if (buildingCategory.id === 1) {
        // If "Show All" is clicked
        return prevCategories.map(category => ({
          ...category,
          isSelected: category.id === 1, // Only "Show All" should be selected
        }));
      } else {
        // If any other category is clicked
        return prevCategories.map(category => ({
          ...category,
          isSelected: category.id === buildingCategory.id ? !category.isSelected : (category.id === 1 ? false : category.isSelected),
        }));
      }
    });
  };

  return (
    <div>
         <Divider horizontal>
      <Header as='h2'>
        <Icon name='bars' />
        Room Usage Bar Chart in Hours
      </Header>
    </Divider>
    <Message info content='Room usage is calculated from 8:00 AM to 5:00 PM (a total of 8 hours per day), Monday through Friday. Weekends are excluded from the hour calculations'/>
      

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
          <FormField>
          <label>Buildings</label>
          {buildingCategories.map(buildingCategory =>(
      <Label key={buildingCategory.id} onClick={() => handleLabelClick(buildingCategory)}
      style={{backgroundColor: buildingCategory.color, color: 'white', marginBottom: '5px'}}
      >
      <Icon name={buildingCategory.isSelected ? 'check square outline' : 'square outline'}  size='large' />
      {buildingCategory.title}
    </Label>
    ))}
          </FormField>
        </FormGroup>
      </Form>

     <span style={{fontSize: '1.5em', marginRight: '10px'}}>Legend:</span>
      <Label content='high usage > 75%' size='large' style={{backgroundColor: '#008000', color: 'white'}}/>
      <Label content='medium usage > 25%' size='large' style={{backgroundColor:'#ffa500', color: 'white'}}/>
      <Label content='low usage > 0%' size='large' style={{backgroundColor: '#ff0000', color: 'white'}}/>

 
      {barChartData.length > 0 &&
        <BarChart
          width={1600}
          height={barChartData.length * 35 + 50} 
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
          <Bar dataKey="used" stackId="a" onClick={(data, index) => handleBarClick(data)}> 
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
