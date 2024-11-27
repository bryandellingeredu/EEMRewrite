import { observer } from "mobx-react-lite";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell, TooltipProps } from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Dimmer, Divider, Form, FormField, FormGroup, Header, Icon, Input, Label, Loader, Message, Segment, SegmentGroup } from "semantic-ui-react";
import { useEffect, useState } from "react";
import { RoomReport } from "../../app/models/roomReport";
import agent from "../../app/api/agent";
import { useStore } from "../../app/stores/store";
import RoomUsageReportDetailModal from "./roomUsageReportDetailModal";

interface BarChartDataRow {
  name: string
  unused: number
  used: number
  usedPercentage: number
}

interface BuildingCategory{
  id: number
  isSelected: boolean
  title: string
  color: string
  displayName: string
}



const getColor = (percentage: number) => {
  if (percentage >= 75) return '#008000'; // Green for high usage
  if (percentage >= 25) return '#ffa500'; // Yellow for medium usage
  return '#ff0000';// Red for  low usage
};

const getDate30DaysAgo = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
  return thirtyDaysAgo;
};

export default observer(function RoomUsageReport() {
  const [loading, setLoading] = useState(true)
  const { graphRoomStore } = useStore();
  const { modalStore } = useStore();
  const { loadingInitial, graphRooms, loadGraphRooms } = graphRoomStore;
  const {openModal, closeModal} = modalStore;
  const [startDate, setStartDate] = useState<Date | null>(getDate30DaysAgo());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [roomReports, setRoomReports] = useState<RoomReport[]>([]);
  const [barChartData, setBarChartData] = useState<BarChartDataRow[]>([]);
  const [buildingCategories, setBuildingCategories] = useState<BuildingCategory[]>(
    [
      { id: 1, isSelected: true, title: 'Show All', color: '#00008B', displayName: 'Show All' },
      { id: 2, isSelected: false, title: 'Bldg 22', color: '#8A3324' , displayName: 'Bldg 22, Upton Hall'  },
      { id: 3, isSelected: false, title: 'Bldg 46', color: '#C2B280' , displayName: 'Bldg 46, Anne Ely Hall'  },
      { id: 4, isSelected: false, title: 'Bldg 47', color: '#FF8C00' , displayName: 'Bldg 47, SSI'  },
      { id: 5, isSelected: false, title: 'Bldg 314', color: '#301934' , displayName: 'Bldg 314, G8 / MICC' },
      { id: 6, isSelected: false, title: 'Bldg 315', color: '#E75480' , displayName: 'Bldg 315, Old G3'  },
      { id: 7, isSelected: false, title: 'Bldg 632', color: '#8B0000' , displayName: 'Bldg 632, ASEP / G3' },
      { id: 8, isSelected: false, title: 'Bldg 650', color: '#006400' , displayName: 'Bldg 650, Collins Hall' },
      { id: 9, isSelected: false, title: 'Bldg 651', color: '#1a1a1a' , displayName: 'Bldg 651, Root Hall' },
      { id: 10, isSelected: false, title: 'Bldg 950', color: '#014d4e', displayName: 'Bldg 950, Ridgway Hall' },
      { id: 11, isSelected: false, title: 'Bldg 330', color: '#8B4513', displayName: 'Bldg 330, DPW' },
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
      setLoading(true);
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
        setLoading(false);
      });
    }
  }, [startDate, endDate, graphRooms.length, loadGraphRooms, buildingCategories]);

const handleBarClick = (data: any) => {
  if (data && data.activePayload && data.activePayload.length > 0) {
    const payload = data.activePayload[0].payload;
    openModal(
      <RoomUsageReportDetailModal
        name={payload.name}
        used={payload.used}
        unused={payload.unused}
        start={startDate || new Date()}
        end={endDate || new Date()}
      />,
      'large'
    );
  }
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

  interface CustomTooltipProps extends TooltipProps<number, string> {}

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const used = payload[0].value || 0;
      const unused = payload[1].value || 0;
      const total = used + unused;
      const usedPercentage = total !== 0 ? ((used / total) * 100).toFixed(2) : "0.00";
  
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <p className="label">{`${payload[0].payload.name}`}</p>
          <p className="desc">{`Used: ${used}`}</p>
          <p className="desc">{`Unused: ${unused}`}</p>
          <p className="desc">{`Percentage Used: ${usedPercentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
         <Divider horizontal>
      <Header as='h2'>
        <Icon name='bars' />
        Room Usage Bar Chart in Hours
      </Header>
    </Divider>
    <Message info content='Room usage is calculated based on room reservations/bookings from 8:00 AM to 5:00 PM (a total of 9 hours per day), Monday through Friday. Weekends are excluded from the hour calculations'/>
      

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
      {buildingCategory.displayName}
    </Label>
    ))}
          </FormField>
        </FormGroup>
      </Form>

     <span style={{fontSize: '1.5em', marginRight: '10px'}}>Legend:</span>
      <Label content='high usage 75-100%' size='large' style={{backgroundColor: '#008000', color: 'white'}}/>
      <Label content='medium usage 25-74%' size='large' style={{backgroundColor:'#ffa500', color: 'white'}}/>
      <Label content='low usage > 0.01-24%' size='large' style={{backgroundColor: '#ff0000', color: 'white'}}/>

      {loading && 
             <Segment style={{height: '500px'}}>
             <Dimmer active>
               <Loader inverted>Loading Data...</Loader>
             </Dimmer>
           </Segment>
      }
 
      {!loading && barChartData.length > 0 &&
        <BarChart
          width={1600}
          height={barChartData.length * 35 + 50} 
          data={barChartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onClick={(data, index) => handleBarClick(data)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" orientation="top"
           label={{ value: 'Hours', position: 'insideTopLeft', offset: 10 }}
           />
          <YAxis type="category" dataKey="name" width={500} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="used" stackId="a" > 
            {barChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.usedPercentage)} />
            ))}
          </Bar>
          <Bar dataKey="unused" stackId="a" fill="#D3D3D3" />
        </BarChart>
      }
    </div>
  );
});
