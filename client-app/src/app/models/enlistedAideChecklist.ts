
export interface EnlistedAideChecklist{
    id: string
    activityId: string
    alcoholEstimate: boolean
    sendToLegalForApproval: boolean
    prepareLegalReview: boolean
    preparePRAForm: boolean
    prepareGuestList: boolean
    prepare4843GuestList: boolean
    prepareMenu: boolean
    menuReviewedByPrincipal: boolean
    orderAlcohol: boolean
    gfebs: boolean
    gatherIce: boolean
    sweepAndMop: boolean
    highTopsAndTables: boolean
    polishSilver: boolean
    cleanCutlery: boolean
    cleanPlates: boolean
    cleanServiceItems: boolean
    napkinsPressed: boolean
    napkinsRolled: boolean
    foodPrep: boolean
    dust: boolean
    cook: boolean
    coffee: boolean
    iceBeverages: boolean
    sterno: boolean
    foodShopping: boolean
    tentSetUp: boolean

}

export class EnlistedAideChecklist implements EnlistedAideChecklist{
    constructor(init?: EnlistedAideChecklistFormValues){
      Object.assign(this, init);
    }
}

export class EnlistedAideChecklistFormValues{
    id: string = '';
    activityId: string = '';
    alcoholEstimate: boolean = false;
    sendToLegalForApproval: boolean = false;
    prepareLegalReview: boolean = false;
    preparePRAForm: boolean = false;
    prepareGuestList: boolean = false;
    prepare4843GuestList: boolean = false;
    prepareMenu: boolean = false;
    menuReviewedByPrincipal: boolean = false;
    orderAlcohol: boolean = false;
    gfebs: boolean = false;
    gatherIce: boolean = false;
    sweepAndMop: boolean = false;
    highTopsAndTables: boolean = false;
    polishSilver: boolean = false;
    cleanCutlery: boolean = false;
    cleanPlates: boolean = false;
    cleanServiceItems: boolean = false;
    napkinsPressed: boolean = false;
    napkinsRolled: boolean = false;
    foodPrep: boolean = false;
    dust: boolean = false;
    cook: boolean = false;
    coffee: boolean = false;
    iceBeverages: boolean = false;
    sterno: boolean = false;
    foodShopping: boolean = false;
    tentSetUp: boolean = false;

    constructor(enlistedAideChecklist?: EnlistedAideChecklistFormValues){
        if(enlistedAideChecklist){
            this.id = enlistedAideChecklist.id;
            this.activityId = enlistedAideChecklist.activityId;
            this.alcoholEstimate = enlistedAideChecklist.alcoholEstimate;
            this.sendToLegalForApproval = enlistedAideChecklist.sendToLegalForApproval;
            this.prepareLegalReview = enlistedAideChecklist.prepareLegalReview;
            this.preparePRAForm = enlistedAideChecklist.preparePRAForm;
            this.prepareGuestList = enlistedAideChecklist.prepareGuestList;
            this.prepare4843GuestList = enlistedAideChecklist.prepare4843GuestList;
            this.prepareMenu = enlistedAideChecklist.prepareMenu;
            this.menuReviewedByPrincipal = enlistedAideChecklist.menuReviewedByPrincipal;
            this.orderAlcohol = enlistedAideChecklist.orderAlcohol;
            this.gfebs = enlistedAideChecklist.gfebs;
            this.gatherIce = enlistedAideChecklist.gatherIce;
            this.sweepAndMop = enlistedAideChecklist.sweepAndMop;
            this.highTopsAndTables = enlistedAideChecklist.highTopsAndTables;
            this.polishSilver = enlistedAideChecklist.polishSilver;
            this.cleanCutlery = enlistedAideChecklist.cleanCutlery;
            this.cleanPlates = enlistedAideChecklist.cleanPlates;
            this.cleanServiceItems = enlistedAideChecklist.cleanServiceItems;
            this.napkinsPressed = enlistedAideChecklist.napkinsPressed;
            this.napkinsRolled = enlistedAideChecklist.napkinsRolled;
            this.foodPrep = enlistedAideChecklist.foodPrep;
            this.dust = enlistedAideChecklist.dust;
            this.cook = enlistedAideChecklist.cook;
            this.coffee = enlistedAideChecklist.coffee;
            this.iceBeverages = enlistedAideChecklist.iceBeverages;
            this.sterno = enlistedAideChecklist.sterno;
            this.foodShopping = enlistedAideChecklist.foodShopping;
            this.tentSetUp = enlistedAideChecklist.tentSetUp;
        }
    }
}