import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { Button, Header, Icon } from "semantic-ui-react";
import Bldg651_Terrace from "../floorplans/651/Bldg651_Terrace";
import Bldg651_1st from "../floorplans/651/Bldg651_1st";
import Bldg651_2nd from "../floorplans/651/Bldg651_2nd";
import Bldg651_3rd from "../floorplans/651/Bldg651_3rd";
import Bldg650_Basement from "../floorplans/650/Bldg650_Basement";
import Bldg650_1st from "../floorplans/650/Bldg650_1st";
import Bldg650_2nd from "../floorplans/650/Bldg650_2nd";
import Bldg650_3rd from "../floorplans/650/Bldg650_3rd";
import { useEffect, useRef, useState } from "react";

interface Props {
    bldg: string;
    floor: string;
    displayName: string;
    email: string;
}

export default observer(function RoomLocationModal({ bldg, floor, displayName, email }: Props) {
    const { modalStore } = useStore();
    const { closeModal } = modalStore;
    const [svgElem, setSvgElem] = useState<SVGElement | null>(null);

    // Refs for SVG elements
    type SvgRefsType = {
        [key: string]: React.RefObject<SVGSVGElement>;
    };

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

    useEffect(() => {
        try {
            const selectedBldg = bldg === 'Bldg 651' ? 'Bldg651' : 'Bldg650';
            const selectedFloor = floor === '1' ? '1st' : floor === '2' ? '2nd' : floor === '3' ? '3rd' : floor;
            const selectedBldgFloor = `${selectedBldg}_${selectedFloor}`;
            const svgRef = svgRefs[selectedBldgFloor];
    
            if (svgRef.current) {
                if (svgElem) {
                    svgElem.removeAttribute('style');
                }
                let fillRoom: string = '';
                if (bldg === 'Bldg 651') {
                    const roomNumber = displayName.match(/Rm ([A-Za-z0-9]+)$/);
                    if (roomNumber) {
                        fillRoom = `r${roomNumber[1]}`;
                    }
                } else {
                    let roomNumber = '';
                    switch (email) {
                        case 'Bldg650CollinsHallB030@armywarcollege.edu':
                            fillRoom = 'rB030';
                            break;
                        case 'Bldg650CollinsHall22ndInfConferenceRoomSVTC@armywarcollege.edu':
                            fillRoom = 'r2010-21';
                            break;
                        case 'Bldg650CollinsHallAachenRoomSVTC@armywarcollege.edu':
                            fillRoom = 'r1030';
                            break;
                        case 'Bldg650CollinsHallArdennesRoomCafeteria@armywarcollege.edu':
                            fillRoom = 'rB059';
                            break;
                        case 'Bldg650CollinsHallBSAPConferenceRoomSVTC@armywarcollege.edu':
                            fillRoom = 'rB047E';
                            break;
                        case 'Bldg650CollinsHallNormandyConferenceRoomSVTC@armywarcollege.edu':
                            fillRoom = 'r3010';
                            break;
                        case 'Bldg650CollinsHall18thInfConferenceRoom@armywarcollege.edu':
                            fillRoom = 'r2009-21';
                            break;
                        case 'Bldg650CollinsHallMediaRoom@armywarcollege.edu':
                            fillRoom = 'rB038';
                            break;
                        case 'Bldg650CollinsHallB033ASVTC@armywarcollege.edu':
                            fillRoom = 'rB033A';
                            break;
                        case 'Bldg650CollinsHallCherbourgRoomRm1015@armywarcollege.edu':
                            fillRoom = 'r1015';
                            break;
                        case 'Bldg650CollinsHallCIOConferenceRoomRmB086@armywarcollege.edu':
                            fillRoom = 'rB086';
                            break;
                        case 'Bldg650CollinsHallJayhawkLoungeRm1028@armywarcollege.edu':
                            fillRoom = 'r1028';
                            break;
                        case 'Bldg650CollinsHallStLoRoomRm3006@armywarcollege.edu':
                            fillRoom = 'r3006';
                            break;
                        case 'Bldg650CollinsHallGuadalcanalRoomRm3013@armywarcollege.edu':
                            fillRoom = 'r3013';
                            break;
                        case 'Bldg650CollinsHallTriangleRoomSVTCRmB034@armywarcollege.edu':
                            fillRoom = 'rB034';
                            break;
                        case 'Bldg650CollinsHallB037SVTC@armywarcollege.edu':
                            fillRoom = 'rB037';
                            break;
                        case 'Bldg650CollinsHallToyRoomRm1018@armywarcollege.edu' :
                            fillRoom = 'r1018';
                            break;
                        default:
                            console.log('room not found');
                            return;
                    }
                }
           
                const svgElement = svgRef.current.querySelector(`#${fillRoom}`) as SVGElement;
    
                if (svgElement) {
                    setSvgElem(svgElement);
                    svgElement.style.fill = 'orange';
                }
            }
        } catch (error) {
            console.log('Error in useEffect:', error);
            return;
        }
    }, [bldg, floor, displayName, email]);

    return (
        <>
            <Button
                floated="right"
                icon
                size="mini"
                color="black"
                compact
                onClick={() => closeModal()}>
                <Icon name="close" />
            </Button>
            <Header as={'h2'} content={displayName} textAlign="center" />
            {bldg === 'Bldg 651' && floor === 'Terrace' && <Bldg651_Terrace ref={svgRefs.Bldg651_Terrace} />}
            {bldg === 'Bldg 651' && floor === '1' && <Bldg651_1st ref={svgRefs.Bldg651_1st} />}
            {bldg === 'Bldg 651' && floor === '2' && <Bldg651_2nd ref={svgRefs.Bldg651_2nd} />}
            {bldg === 'Bldg 651' && floor === '3' && <Bldg651_3rd ref={svgRefs.Bldg651_3rd} />}
            {bldg === 'Collins Hall, Bldg 650' && floor === 'Basement' && <Bldg650_Basement ref={svgRefs.Bldg650_Basement} />}
            {bldg === 'Collins Hall, Bldg 650' && floor === '1' && <Bldg650_1st ref={svgRefs.Bldg650_1st} />}
            {bldg === 'Collins Hall, Bldg 650' && floor === '2' && <Bldg650_2nd ref={svgRefs.Bldg650_2nd} />}
            {bldg === 'Collins Hall, Bldg 650' && floor === '3' && <Bldg650_3rd ref={svgRefs.Bldg650_3rd} />}
        </>
    );
});