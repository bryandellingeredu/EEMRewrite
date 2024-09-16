import { action, makeAutoObservable, runInAction } from "mobx";
import { Person } from "../models/person";
import agent from "../api/agent";

export default class PersonStore {


    personRegistry = new Map<number, Person>();
    loadingInitial = false;

    constructor() {
        makeAutoObservable(this, {
            loadPersons: action,
            setLoadingInitial: action,
        });
    }

    get persons() {
        return Array.from(this.personRegistry.values())
    }

    get fullNames(){
        return Array.from(this.personRegistry.values())
    }

    loadPersons = async () => {
        this.setLoadingInitial(true);
        try {
            const persons = await agent.Persons.list();
            runInAction(() => {
                persons.forEach(person => {
                    this.personRegistry.set(person.personID, person);
                });
                this.setLoadingInitial(false);
            });
        } catch (error) {
            console.error(error);
            runInAction(() => {
                this.setLoadingInitial(false);
            });
        }

        // this.setLoadingInitial(true);
        // try {
        //     const persons = await agent.Persons.list();
        //     persons.forEach(person => {
        //         this.personRegistry.set(person.personID, person);
        //     })
        //     this.setLoadingInitial(false);
        // } catch (error) {
        //     console.log(error);
        //     this.setLoadingInitial(false);
        // }
    }

    setLoadingInitial = (state: boolean) => {
        this.loadingInitial = state;
    };
}