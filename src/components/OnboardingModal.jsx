import SizeStep from "./onboarding/SizeStep.jsx";
import StylesStep from "./onboarding/StylesStep.jsx";
import AboutStep from "./onboarding/AboutStep.jsx";
import WelcomeStep from "./onboarding/WelcomeStep.jsx";
import {useStore} from "../provider/StoreContext.jsx";
import {useAuth} from "../provider/AuthProvider.jsx";
import {useState} from "react";
import styles from './ui/OnboardingModal.module.css'
import {observer} from "mobx-react";
import {useNavigate} from "react-router-dom";
import {AUTH_TOKEN} from "../constants.js";
import {runInAction} from "mobx";

const OnboardingModal = observer(() => {
    const store = useStore();
    const auth = useAuth();
    const [currentStep, setCurrentStep] = useState(1);

    const [preferences, setPreferences] = useState({
        gender: 'female',
        age: store.authStore.data?.preferences?.age || 25,
        styles: [],
        clothing_size: store.authStore.data?.preferences?.clothing_size || '',
        size_parameters: store.authStore.data?.preferences?.size_parameters || {
            breast: 90,
            waist: 60,
            hip: 90
        },
        wearing_styles: store.authStore.data?.preferences?.wearing_styles || []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSaveChanges = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('https://api.lookvogue.ru/v1/user', {
                method: 'PATCH',
                headers: {
                    "Authorization": `tma ${AUTH_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    preferences: {
                        clothing_size: preferences.clothing_size,
                        size_parameters: preferences.size_parameters,
                        wearing_styles: preferences.wearing_styles,
                        gender: 'female',
                        age: preferences.age,
                        styles: preferences.styles,
                    }
                })
            });

            if (!response.ok) throw new Error('Update failed');


            runInAction(() => {
                if (store.authStore.data) {
                    store.authStore.data.preferences = {
                        clothing_size: preferences.clothing_size,
                        size_parameters: preferences.size_parameters,
                        wearing_styles: preferences.wearing_styles,
                        gender: 'female',
                        age: preferences.age,
                        styles: preferences.styles,
                    };
                }
            });

        } catch (error) {
            console.error('Update error:', error);
            setError('Failed to save changes');
        } finally {
            setIsLoading(false);
        }
    };


    const updateParam = (field, value) => {
        if (['breast', 'waist', 'hip'].includes(field)) {
            setPreferences(prev => ({
                ...prev,
                size_parameters: {
                    ...prev.size_parameters,
                    [field]: value
                }
            }));
        } else if (field === 'wearing_styles' || field === 'styles') {
            setPreferences(prev => {
                const currentArray = prev[field];
                const newArray = currentArray.includes(value)
                    ? currentArray.filter(f => f !== value)
                    : [...currentArray, value];

                return {
                    ...prev,
                    [field]: newArray
                };
            });
        } else {
            setPreferences(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    console.log(preferences)

    const navigate = useNavigate()

    const [isClosed, setIsClosed] = useState(false);

    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 4));
    };

    const next = () => {
        console.log(store)
        if (store?.authStore?.data?.preferences?.complete_onboarding) {
            navigate('/cards');
        } else {
            nextStep()
        }
    }

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };


    const skipOnboarding = () => {
        handleSaveChanges();
        setIsClosed(true);
        navigate('/cards')
    };


    const completeOnboarding = () => {
        handleSaveChanges();
        setIsClosed(true);
        navigate('/cards')
    };

    return (
        <div className={styles.onboardingModal}>
            <div className={styles.onboardingBackGround}/>
            <img className={styles.logo} src='/logo.svg' alt='/logo.png'/>
            <div className={styles.onboardingContent}>

                {currentStep === 1 && (
                    <WelcomeStep
                        userName={auth.data?.first_name}
                        userSername={auth.data?.last_name}
                        onNext={next}
                    />
                )}

                {currentStep === 2 && (
                    <AboutStep
                        age={preferences.age}
                        onUpdate={updateParam}
                        onNext={() => setCurrentStep(3)}
                        onBack={() => setCurrentStep(1)}
                        onSkip={skipOnboarding}
                    />
                )}


                {currentStep === 3 && (
                    <StylesStep
                        selectedStyles={preferences.styles}
                        onUpdate={updateParam}
                        onBack={prevStep}
                        onNext={nextStep}
                        onSkip={skipOnboarding}
                    />
                )}

                {currentStep === 4 && (
                    <SizeStep
                        params={preferences}
                        updateParam={updateParam}
                        onNext={completeOnboarding}
                        onSkip={skipOnboarding}
                        onBack={prevStep}

                    />
                )}
            </div>
        </div>
    );
});
export default OnboardingModal;