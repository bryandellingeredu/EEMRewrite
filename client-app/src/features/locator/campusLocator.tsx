import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { Divider, Header, Icon, Grid, GridRow, Form, FormGroup, FormSelect, GridColumn, CardGroup, Card, CardContent, CardHeader, CardMeta, CardDescription } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { bldgOptions } from "../../app/models/bldgOptions";
import Bldg651_Terrace from "../floorplans/651/Bldg651_Terrace";
import Bldg651_1st from "../floorplans/651/Bldg651_1st";
import Bldg651_2nd from "../floorplans/651/Bldg651_2nd";
import Bldg651_3rd from "../floorplans/651/Bldg651_3rd";
import Bldg650_Basement from "../floorplans/650/Bldg650_Basement";
import Bldg650_1st from "../floorplans/650/Bldg650_1st";
import Bldg650_2nd from "../floorplans/650/Bldg650_2nd";
import Bldg650_3rd from "../floorplans/650/Bldg650_3rd";
import { GraphRoom } from "../../app/models/graphRoom";
import RoomListItem from "../rooms/RoomListItem";

interface RoomOption {
    key: string;
    text: string;
    value: string;
}

interface FloorOption {
    key: string;
    text: string;
    value: string;
    rooms: RoomOption[];
}

interface BldgOption {
    key: string;
    text: string;
    value: string;
    floors: FloorOption[];
}

export default observer(function CampusLocator(){

    type SvgRefsType = {
        [key: string]: React.RefObject<SVGSVGElement>;
    };

     // Refs for SVG elements
     const svgRefs: SvgRefsType = {
        Bldg651_Terrace: useRef<SVGSVGElement>(null),
        Bldg651_1st: useRef<SVGSVGElement>(null),
        Bldg651_2nd: useRef<SVGSVGElement>(null),
        Bldg651_3rd: useRef<SVGSVGElement>(null),
        Bldg650_Basement: useRef<SVGSVGElement>(null),
        Bldg650_1st: useRef<SVGSVGElement>(null),
        Bldg650_2nd: useRef<SVGSVGElement>(null),
        Bldg650_3rd: useRef<SVGSVGElement>(null),
    };

    const [selectedBldgFloor, setSelectedBldgFloor] = useState<string | null>(null);
    const [fillRoom, setFillRoom] = useState<string | null>(null);

    const [selectedBldg, setSelectedBldg] = useState<BldgOption | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<FloorOption | null>(null);

    const [personValue, setPersonValue] = useState<string | undefined>(undefined);
    const [bldgValue, setBldgValue] = useState<string | undefined>(undefined);
    const [floorValue, setFloorValue] = useState<string | undefined>(undefined);
    const [roomValue, setRoomValue] = useState<string | undefined>(undefined);

    const [floorOptions, setFloorOptions] = useState<FloorOption[]>([]);
    const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);

    const [svgElem, setSvgElem] = useState<SVGElement | null>(null);

    const { personStore, graphRoomStore } = useStore();
    const { persons, loadPersons } = personStore;
    const {graphRooms, loadGraphRooms} = graphRoomStore;

    const [graphRoom, setGraphRoom] = useState<GraphRoom | null >(null);


    const [arrayOfPersons, setArrayOfPersons] = useState<any[]>([])
    const [clickedRoom, setClickedRoom] = useState<string | null>(null);
    const [showAvailabilityIndicatorList, setShowAvailabilityIndicatorList] = useState<string[]>([]);

    
  function handleAddIdToShowAvailabilityIndicatorList(id: string) {
    setShowAvailabilityIndicatorList([...showAvailabilityIndicatorList, id]);
  }

    useEffect(() => {
        if (persons.length < 1) loadPersons();
    }, [personStore]);

    useEffect(() => {
        if(!graphRooms.length) loadGraphRooms()
      }, [loadGraphRooms, graphRooms.length])

    const fullNamePersons = persons.map(person => ({
        ...person,
        fullName: `${person.lastName}, ${person.firstName}`,
    }));

    const sortedPersons = fullNamePersons.sort((a, b) =>
        a.fullName.localeCompare(b.fullName)
    );

    const regex = /^(\d{3})-(\d{3})(\d{4})$/;

    const personOptions = sortedPersons.map(person => ({
        key: person.fullName,
        text: person.fullName,
        value: person.fullName,        
        details: {
            personID: person.personID,
            firstName: person.firstName,
            lastName: person.lastName,
            titleRank: person.rankAbbreviation,
            position: person.positionTitle,
            email: person.email,
            bldgNum: person.buildingNumber,
            roomNum: person.roomNumber,
            phone: person.phoneNumber.replace(regex, '$1-$2-$3'),
            org: person.organization
        }
    }));

    const handlePersonChange = (_e: React.SyntheticEvent<HTMLElement>, { value }: any) => {
        setArrayOfPersons([]);
        setPersonValue("");
        setRoomOptions([]);
        setFloorOptions([]);
        setSelectedBldgFloor("");
        setSelectedFloor(null);
        setSelectedBldg(null);
        setBldgValue("");
        setFloorValue("");
        setRoomValue("");
        setGraphRoom(null);

        setPersonValue(value);
        const person = personOptions.find(p => p.value === value) || null;

        if (person) {
            setArrayOfPersons(prevArray => [...prevArray, person]);
            const bldgObj = bldgOptions.find(b => b.value === person.details.bldgNum) || null;
            if (bldgObj) {
                setSelectedBldg(bldgObj);
                setBldgValue(bldgObj.value);
                setFloorOptions(bldgObj.floors);

                const roomNum = person ? person.details.roomNum : null;

                const floorObj = bldgObj.floors.find(f => f.rooms.some(r => r.value === `r${roomNum}`)) || null;
                if (floorObj) {
                    setSelectedFloor(floorObj);
                    setFloorValue(floorObj.value);
                    setSelectedBldgFloor(`Bldg${bldgObj.value}_${floorObj.value}`);
                }

                const roomObj = bldgObj.floors.flatMap(f => f.rooms).find(r => r.value === `r${roomNum}`) || null;
                if (roomObj) {
                    const allRoomsObj = bldgObj.floors.flatMap(floor =>
                        floor.rooms.map(room => ({
                            key: room.key,
                            text: room.text,
                            value: room.value
                        }))
                    );
                    setRoomOptions(allRoomsObj ? allRoomsObj : []);

                    setRoomValue(roomObj.value);
                    setFillRoom(roomObj.value);
                } else {
                    setRoomValue("");
                    setGraphRoom(null);
                }
            } else {
                // person's building number doesn't match any building listed
            }
        }
    };


    const handleBldgChange = (_e: React.SyntheticEvent<HTMLElement>, { value }: any) => {
        setBldgValue(value);
        setArrayOfPersons([]);
        setRoomOptions([]);
        setFloorOptions([]);
        setSelectedFloor(null);
        setSelectedBldgFloor("");
        setFloorValue("");
        setRoomValue("");
        setPersonValue("");
        setGraphRoom(null);

        // bldg will contain the object for the selected building (i.e. floors and rooms)
        const bldg = bldgOptions.find(b => b.value === value);

        if (bldg) {
            // stores building object
            setSelectedBldg(bldg);

            // grabs all rooms for the building
            const allrooms = bldg.floors.flatMap(floor =>
                floor.rooms.map(room => ({
                    key: room.key,
                    text: room.text,
                    value: room.value
                }))
            );
            setFloorOptions(bldg ? bldg.floors : []);
            setRoomOptions(allrooms ? allrooms : []);
        }
    };

    const handleFloorChange = (_e: React.SyntheticEvent<HTMLElement>, { value }: any) => {
        setFloorValue(value);
        setArrayOfPersons([]);
        setRoomValue("");
        setPersonValue("");
        setGraphRoom(null);

        const floorObj = selectedBldg ? selectedBldg.floors.find(f => f.value === value) || null : null;
        setSelectedFloor(floorObj);
        if (selectedBldg) {
            if (floorObj) {
                setRoomOptions(floorObj.rooms);
                setSelectedBldgFloor(`Bldg${selectedBldg.value}_${floorObj.value}`);
            } else {
                // grabs all rooms for the building
                const allrooms = selectedBldg.floors.flatMap(floor =>
                    floor.rooms.map(room => ({
                        key: room.key,
                        text: room.text,
                        value: room.value
                    }))
                );
                setRoomOptions(allrooms ? allrooms : []);
            }
        }
    };

    const handleRoomChange = (_e: React.SyntheticEvent<HTMLElement>, { value }: any) => {
        setRoomValue(value);
        setArrayOfPersons([]);
        setPersonValue("");
        setGraphRoom(null);

        const roomObj = roomOptions ? roomOptions.find(r => r.value === value) || null : null;
        const floorObj = selectedBldg ? selectedBldg.floors.find(f => f.rooms.some(r => r.value === value)) || null : null;
        if (selectedBldg && floorObj && roomObj) {
            setSelectedFloor(floorObj);
            setSelectedBldgFloor(`Bldg${selectedBldg.value}_${floorObj.value}`);
            setFillRoom(roomObj.value);

            // this will be used to build Cards for each person in the room
            const personArray = personOptions.filter(person => person.details.bldgNum === selectedBldg.value && person.details.roomNum === roomObj.key);
            setArrayOfPersons([]);
            setArrayOfPersons(personArray);
            findAndSetGraphRoom(roomObj.value);
        }
    };

    useEffect(() => {
        if (fillRoom && selectedBldgFloor) {
            if (selectedBldg && selectedFloor) {
                const svgRef = svgRefs[selectedBldgFloor];
                if (svgRef.current) {
                    if (svgElem) {
                        svgElem.removeAttribute('style');
                    }
                    const svgElement = svgRef.current.querySelector(`#${fillRoom}`) as SVGElement;

                    if (svgElement) {
                        setSvgElem(svgElement);
                        svgElement.style.fill = 'orange';
                    }
                }
            }
        }
    }, [fillRoom]);

    const handleClick: React.MouseEventHandler<SVGElement> = (event) => {
        setGraphRoom(null);
        const target = event.target as SVGElement;

        // 1) r followed by a number
        // 2) rT followed by a number
        // 3) rB followed by a number
        if (target.id.match(/^r(T|B)?\d+.*$/)) {
            setClickedRoom(target.id);

        } else if (target.tagName === 'tspan') {
            // Traverse up the DOM to find the parent <text> element
            const textElement = target.closest('text') as SVGTextElement;

            if (textElement) {
                if (textElement.id.toString().includes("t")) {
                    setClickedRoom(textElement.id.toString().replace("t", "r"));
                } else if (textElement.id.toString().includes("rm")) {
                    setClickedRoom(textElement.id.toString().replace("rm", "r"))
                } else {
                    console.log('something is different:', textElement.id);
                }
            } else {
                console.log('No parent <text> element found.');
            }
        } else {
            console.log('Other SVG element clicked:', target.tagName);
        }
    };

    useEffect(() => {
        if (clickedRoom && graphRooms && graphRooms.length > 0) {
            debugger;
            // need the building number as well
            setArrayOfPersons([]);
            setPersonValue("");
            setRoomValue("");

            if (selectedBldg) {
                
                const roomObj = roomOptions ? roomOptions.find(r => r.value === clickedRoom) || null : null;
                const floorObj = selectedBldg ? selectedBldg.floors.find(f => f.rooms.some(r => r.value === clickedRoom)) || null : null;
                setSelectedFloor(floorObj);
                if (floorObj) {
                    setSelectedBldgFloor(`Bldg${selectedBldg.value}_${floorObj.value}`);
                    setFloorValue(floorObj.value);
                }

                if (roomObj) {
                    setRoomValue(roomObj.value);
                    setFillRoom(roomObj.value);

                    // fill the Person Cards 
                    const personArray = personOptions.filter(person => person.details.bldgNum === selectedBldg.value && person.details.roomNum === roomObj.key);
                    setArrayOfPersons([]);
                    setArrayOfPersons(personArray);
                    findAndSetGraphRoom(roomObj.value);
                } else {
                    setRoomValue("");
                    setGraphRoom(null);
                }
            }
        }
    }, [clickedRoom, graphRooms, graphRooms.length]);

    const findAndSetGraphRoom = (r : string) => {
        debugger;
        if(selectedBldg && r ){
        const roomNumber = r.substring(1);
        let filteredGraphRooms = [...graphRooms]
        if (selectedBldg.value === '651'){
            filteredGraphRooms = filteredGraphRooms.filter(x => x.building === 'Bldg 651');
            let gRoom: GraphRoom | undefined = filteredGraphRooms.find(x => {
                let roomNumberMatch = x.displayName.match(/Rm ([A-Za-z0-9]+)$/);
                return roomNumberMatch && roomNumberMatch[1] === roomNumber;
            });
            if(gRoom) setGraphRoom(gRoom);
          } else {
            filteredGraphRooms = filteredGraphRooms.filter(x => x.building === 'Collins Hall, Bldg 650');
            
            let gRoom: GraphRoom | undefined = filteredGraphRooms.find(x => {
                // Use the regex directly to test if roomValue exists in displayName
                let roomNumberMatch = x.displayName.match(new RegExp(`\\b${roomNumber}\\b`));
                
                // Return true if a match is found
                return roomNumberMatch !== null;
            });

            if (gRoom){
                setGraphRoom(gRoom);
            }else{
                switch (roomNumber) {
                    case '2010-21':
                        setGraphRoom(
                            filteredGraphRooms.find(
                                x => x.emailAddress === 'Bldg650CollinsHall22ndInfConferenceRoomSVTC@armywarcollege.edu'
                            ) || null
                        );
                        break;
                    case '1030':
                        setGraphRoom(
                                filteredGraphRooms.find(
                                    x => x.emailAddress === 'Bldg650CollinsHallAachenRoomSVTC@armywarcollege.edu'
                                ) || null
                            );
                            break;
                     case '1030':
                        setGraphRoom(
                                filteredGraphRooms.find(
                                    x => x.emailAddress === 'Bldg650CollinsHallAachenRoomSVTC@armywarcollege.edu'
                                ) || null
                              );
                              break;
                    case 'B059':
                        setGraphRoom(
                            filteredGraphRooms.find(
                                x => x.emailAddress === 'Bldg650CollinsHallArdennesRoomCafeteria@armywarcollege.edu'
                            ) || null
                          );
                            break;
                    case 'B047E':
                         setGraphRoom(
                            filteredGraphRooms.find(
                                x => x.emailAddress === 'Bldg650CollinsHallBSAPConferenceRoomSVTC@armywarcollege.edu'
                              ) || null
                            );
                        break;
                    case '3010':
                            setGraphRoom(
                               filteredGraphRooms.find(
                                   x => x.emailAddress === 'Bldg650CollinsHallNormandyConferenceRoomSVTC@armywarcollege.edu'
                                 ) || null
                               );
                           break;
                    case '2009-21':
                            setGraphRoom(
                               filteredGraphRooms.find(
                                   x => x.emailAddress === 'Bldg650CollinsHall18thInfConferenceRoom@armywarcollege.edu'
                                 ) || null
                               );
                           break;
                        case 'B038':
                            setGraphRoom(
                               filteredGraphRooms.find(
                                   x => x.emailAddress === 'Bldg650CollinsHallMediaRoom@armywarcollege.edu'
                                 ) || null
                               );
                           break;
                    default:
                        setGraphRoom(null);
                }
            }
          }
        }

    }

    if (graphRoomStore.loadingInitial || personStore.loadingInitial) return <LoadingComponent content='Loading data' />

   return(
    <>
       <Divider horizontal>
       <Header as='h2'>
       <Icon name='compass'  />
          Campus Locator
       </Header>
       </Divider>
       <Grid stackable centered columns={1} padded>
       <GridRow stretched>
    <Form style={{ width: '100%' }}>
      <FormGroup widths="equal">
        <FormSelect
          name="personSelect"
          label="Select/Search a Person"
          search
          fluid
          clearable
          selection
          placeholder="Select a Person"
          value={personValue}
          options={personOptions}
          onChange={handlePersonChange}
        />
        <FormSelect
          name="bldgSelect"
          label="Select Building"
          search
          fluid
          clearable
          selection
          placeholder="Select a Building"
          value={bldgValue}
          options={bldgOptions}
          onChange={handleBldgChange}
        />
        <FormSelect
          name="floorSelect"
          label="Select the Floor"
          search
          fluid
          clearable
          selection
          placeholder="Select the Floor"
          value={floorValue}
          options={floorOptions}
          onChange={handleFloorChange}
          disabled={!selectedBldg} // Disable if no building is selected
        />
        <FormSelect
          name="roomSelect"
          label="Select a Room"
          search
          fluid
          clearable
          selection
          placeholder="Select a Room"
          value={roomValue}
          options={roomOptions}
          onChange={handleRoomChange}
          disabled={!selectedBldg} // Disable if no floor is selected
        />
      </FormGroup>
    </Form>
  </GridRow>
        <GridRow>
        <GridColumn width={12} >
                        {selectedBldgFloor === 'Bldg651_Terrace' && <Bldg651_Terrace ref={svgRefs.Bldg651_Terrace} onClick={handleClick} />}
                        {selectedBldgFloor === 'Bldg651_1st' && <Bldg651_1st ref={svgRefs.Bldg651_1st} onClick={handleClick} />}
                        {selectedBldgFloor === 'Bldg651_2nd' && <Bldg651_2nd ref={svgRefs.Bldg651_2nd} onClick={handleClick} />}
                        {selectedBldgFloor === 'Bldg651_3rd' && <Bldg651_3rd ref={svgRefs.Bldg651_3rd} onClick={handleClick} />}
                        {selectedBldgFloor === 'Bldg650_Basement' && <Bldg650_Basement ref={svgRefs.Bldg650_Basement} onClick={handleClick} />}
                        {selectedBldgFloor === 'Bldg650_1st' && <Bldg650_1st ref={svgRefs.Bldg650_1st} onClick={handleClick} />}
                        {selectedBldgFloor === 'Bldg650_2nd' && <Bldg650_2nd ref={svgRefs.Bldg650_2nd} onClick={handleClick} />}
                        {selectedBldgFloor === 'Bldg650_3rd' && <Bldg650_3rd ref={svgRefs.Bldg650_3rd} onClick={handleClick} />}
        </GridColumn>
        <GridColumn width={4}>
                        <CardGroup>
                            {arrayOfPersons.map(person => (
                                <Card fluid key={person.details.personID}>
                                    <CardContent>
                                        <CardHeader>{person.details.title} {person.value}</CardHeader>
                                        <CardMeta>
                                            {person.details.position}
                                        </CardMeta>
                                        <CardDescription>
                                            <div>{person.details.org}</div>
                                            <div>Building: {person.details.bldgNum}</div>
                                            <div>Room: {person.details.roomNum}</div>
                                        </CardDescription>
                                    </CardContent>
                                    <CardContent extra>
                                        <Icon name='phone' /> {person.details.phone}
                                    </CardContent>
                                    <CardContent extra>
                                        <a href={`mailto:${person.details.email}`}>
                                            <Icon name='at' /> {person.details.email}
                                        </a>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardGroup>
                        {graphRoom &&
                         <RoomListItem
                         room={graphRoom}
                         showAvailabilityIndicatorList={showAvailabilityIndicatorList}
                         addIdToShowAvailabilityIndicatorList={() => handleAddIdToShowAvailabilityIndicatorList(graphRoom.id)}
                       />
                        }
            </GridColumn>
        </GridRow>
       </Grid>
    </>
   )
})