import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { Button, Grid, Header, Icon } from "semantic-ui-react";
import agent from "../../app/api/agent";
import { FlagReportDTO } from "../../app/models/flagReportDTO";
import { toast } from "react-toastify";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useReactToPrint } from "react-to-print";
import { FlagReportComponentToPrint } from "./flagReportComponentToPrint";

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

interface OptionType {
  value: number;
  label: string;
}

export default function FlagReport(){
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FlagReportDTO[]>([]);
  const currentMonth = new Date().getMonth() + 1; // getMonth is zero-based
  const initialMonth = months.find(month => month.value === currentMonth) || months[0];

  const [selectedMonth, setSelectedMonth] = useState<OptionType | null>(initialMonth);


const handleChange = (selectedMonth : OptionType | null) => {
    if (selectedMonth) {
        const selectedIndex = orderedMonths.findIndex(month => month.value === selectedMonth.value);

        let direction;
        if (selectedIndex < 6) {
            direction = 'backward';
        } else {
            direction = 'forward';
        }
        
        setSelectedMonth(selectedMonth);
        loadData(selectedMonth, direction);
    }
};
  useEffect(() => {
    (async () => {
        await loadData(initialMonth, 'forward');
      })();
}, []);

async function loadData(month : OptionType | null, direction: string){
    setLoading(true);
    try{
        if(month && month.value){
            const response : FlagReportDTO[] = await agent.HostingReports.getFlagReport(month.value, direction);
            setData(response);
            setLoading(false);
        }
    
    }catch(error){
      console.log(error);
      setLoading(false);
      toast.error('an error occured loading flag reports');
    }
}

function shiftMonths(months: OptionType[], currentMonth: number): OptionType[] {
    const currentMonthIndex = months.findIndex(month => month.value === currentMonth);

    // Calculate how many positions we should shift to make the current month 6th in the list.
    const shiftPositions = currentMonthIndex - 5;

    // Create a new array with the months shifted to the right position.
    const shiftedMonths = months.slice(shiftPositions).concat(months.slice(0, shiftPositions));

    return shiftedMonths;
}
const orderedMonths = shiftMonths(months, initialMonth.value );

const componentRef = useRef(null);

const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  
  return(
    <>
    <Grid columns={15}>
        <Grid.Column>
      <Select 
        value={selectedMonth}
        onChange={handleChange}
        options={orderedMonths}
        isSearchable
        placeholder="Select a month..."
      />
      </Grid.Column>
      {!loading && data && data.length > 0 && 
        <Grid.Column width={3}>
               <Button
            color="teal"
            icon
            labelPosition="left"
            onClick={handlePrint}
          >
            <Icon name="print" />
            Print Flag Report
          </Button>
        </Grid.Column>
      }
      </Grid>
      {loading && <LoadingComponent content="loading flag report"/>}
      {!loading && data && data.length > 0 && selectedMonth && selectedMonth.label &&

           <FlagReportComponentToPrint ref={componentRef} data={data} month={selectedMonth.label} />

      }
      {!loading && !(data && data.length > 0) && 
            <Header content='No Data Found' />
      }
    </>
  );
}
