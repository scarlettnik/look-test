import { makeAutoObservable } from "mobx";

class Onboarding {

    constructor() {
        makeAutoObservable(this);
    }

    setOnboardingCompleted(completed) {
        this.onboardingCompleted = completed;

    }
}

export default Onboarding;