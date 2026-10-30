"""Regional language agricultural advisory generator."""

from typing import Any, Dict, List, Optional
from tools import BaseTool


class RegionalAdvisorTool(BaseTool):
    """Generates simple, actionable farm advisories in regional Indian languages and English."""

    name = "regional_advisor"
    description = (
        "Translates technical telemetry findings and dosages into simple, actionable farmer advisories "
        "in English, Hindi (हिंदी), Telugu (తెలుగు), Tamil (தமிழ்), Marathi (मराठी), Punjabi (ਪੰਜਾਬੀ), "
        "Gujarati (ગુજરાતી), Kannada (ಕನ್ನಡ), or Bengali (বাংলা). "
        "Input: {'language': 'Hindi', 'crop': 'rice', 'stress_level': 'HIGH', 'fertilizer_summary': dict, 'water_summary': dict, 'wash_off': false}"
    )

    TEMPLATES = {
        "Hindi": {
            "headline": "🌾 कृषि परामर्श: {crop_name} में {stress_word}",
            "stress_words": {
                "LOW": "अनुकूल स्थिति (सामान्य देखरेख)",
                "MODERATE": "मध्यम तनाव (2 दिन में कार्यवाही)",
                "HIGH": "गंभीर तनाव (आज ही कार्यवाही आवश्यक)",
                "CRITICAL": "अति-गंभीर आपातकाल (फसल क्षति का खतरा)"
            },
            "today_action": "आज का जरूरी कार्य: {water_action}. {fert_action_today}.",
            "warning": "सावधानी: {warning_text}",
            "dont_do": "क्या न करें: {dont_do_text}",
            "voice_intro": "नमस्ते किसान भाई, आपके खेत में {crop_name} फसल के लिए महत्वपूर्ण सलाह है।"
        },
        "Telugu": {
            "headline": "🌾 రైతు సలహా: {crop_name} పంటలో {stress_word}",
            "stress_words": {
                "LOW": "సాధారణ స్థితి",
                "MODERATE": "మధ్యస్థ ఒత్తిడి (2 రోజుల్లో చర్య)",
                "HIGH": "తీవ్రమైన ఒత్తిడి (తక్షణ చర్య అవసరం)",
                "CRITICAL": "అత్యవసర పరిస్థితి (పంట నష్టం ప్రమాదం)"
            },
            "today_action": "ఈరోజు చేయవలసిన పనులు: {water_action}. {fert_action_today}.",
            "warning": "హెచ్చరిక: {warning_text}",
            "dont_do": "చేయకూడనివి: {dont_do_text}",
            "voice_intro": "రైతు మిత్రులారా, మీ {crop_name} పంటకు సంబంధించిన ముఖ్యమైన సూచన."
        },
        "Tamil": {
            "headline": "🌾 விவசாய ஆலோசனை: {crop_name} பயிரில் {stress_word}",
            "stress_words": {
                "LOW": "சீரான நிலை",
                "MODERATE": "மிதமான அழுத்தம் (2 நாட்களில் நடவடிக்கை)",
                "HIGH": "கடுமையான அழுத்தம் (இன்றே நடவடிக்கை தேவை)",
                "CRITICAL": "அவசர நிலை (பயிர் இழப்பு அபாயம்)"
            },
            "today_action": "இன்றைய முக்கிய பணி: {water_action}. {fert_action_today}.",
            "warning": "எச்சரிக்கை: {warning_text}",
            "dont_do": "செய்யக்கூடாதவை: {dont_do_text}",
            "voice_intro": "வணக்கம் விவசாய நண்பரே, உங்கள் {crop_name} பயிருக்கான உடனடி ஆலோசனை."
        },
        "Marathi": {
            "headline": "🌾 शेतकरी सल्ला: {crop_name} पिकावर {stress_word}",
            "stress_words": {
                "LOW": "अनुकूल स्थिती (सर्वसाधारण काळजी)",
                "MODERATE": "मध्यम ताण (२ दिवसांत उपाययोजना)",
                "HIGH": "गंभीर ताण (आजच कार्यवाही आवश्यक)",
                "CRITICAL": "अति-गंभीर आणीबाणी (पिकाचे नुकसान टाळा)"
            },
            "today_action": "आजची कृती: {water_action}. {fert_action_today}.",
            "warning": "सावधानता: {warning_text}",
            "dont_do": "काय करू नये: {dont_do_text}",
            "voice_intro": "नमस्कार शेतकरी बंधूंनो, तुमच्या {crop_name} पिकासाठी विशेष कृषी सल्ला."
        },
        "Punjabi": {
            "headline": "🌾 ਕਿਸਾਨ ਸਲਾਹ: {crop_name} ਦੀ ਫ਼ਸਲ ਵਿੱਚ {stress_word}",
            "stress_words": {
                "LOW": "ਸਾਧਾਰਨ ਹਾਲਤ",
                "MODERATE": "ਦਰਮਿਆਨਾ ਤਣਾਅ (2 ਦਿਨਾਂ ਵਿੱਚ ਹੱਲ)",
                "HIGH": "ਗੰਭੀਰ ਤਣਾਅ (ਅੱਜ ਹੀ ਕਾਰਵਾਈ ਜ਼ਰੂਰੀ)",
                "CRITICAL": "ਨਾਜ਼ੁਕ ਐਮਰਜੈਂਸੀ (ਨੁਕਸਾਨ ਦਾ ਖ਼ਤਰਾ)"
            },
            "today_action": "ਅੱਜ ਦਾ ਜ਼ਰੂਰੀ ਕੰਮ: {water_action}. {fert_action_today}.",
            "warning": "ਸਾਵਧਾਨੀ: {warning_text}",
            "dont_do": "ਕੀ ਨਹੀਂ ਕਰਨਾ: {dont_do_text}",
            "voice_intro": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ, ਤੁਹਾਡੀ {crop_name} ਫ਼ਸਲ ਲਈ ਅਹਿਮ ਸਲਾਹ।"
        },
        "Gujarati": {
            "headline": "🌾 ખેડૂત સલાહ: {crop_name} પાકમાં {stress_word}",
            "stress_words": {
                "LOW": "અનુકૂળ સ્થિતિ",
                "MODERATE": "મધ્યમ તાણ (૨ દિવસમાં પગલાં)",
                "HIGH": "ગંભીર તાણ (આજે જ પગલાં જરૂરી)",
                "CRITICAL": "અતિ ગંભીર કટોકટી (પાક નુકસાન જોખમ)"
            },
            "today_action": "આજનું જરૂરી કામ: {water_action}. {fert_action_today}.",
            "warning": "ચેતવણી: {warning_text}",
            "dont_do": "શું ન કરવું: {dont_do_text}",
            "voice_intro": "નમસ્તે ખેડૂત મિત્રો, આપના {crop_name} પાક માટે મહત્વપૂર્ણ સલાહ."
        },
        "Kannada": {
            "headline": "🌾 ರೈತ ಸಲಹೆ: {crop_name} ಬೆಳೆಯಲ್ಲಿ {stress_word}",
            "stress_words": {
                "LOW": "ಸಾಮಾನ್ಯ ಸ್ಥಿತಿ",
                "MODERATE": "ಮಧ್ಯಮ ಒತ್ತಡ (2 ದಿನಗಳಲ್ಲಿ ಕ್ರಮ)",
                "HIGH": "ತೀವ್ರ ಒತ್ತಡ (ಇಂದೇ ತುರ್ತು ಕ್ರಮ)",
                "CRITICAL": "ತುರ್ತು ಪರಿಸ್ಥಿತಿ (ಬೆಳೆ ಹಾನಿ ಅಪಾಯ)"
            },
            "today_action": "ಇಂದಿನ ಪ್ರಮುಖ ಕೆಲಸ: {water_action}. {fert_action_today}.",
            "warning": "ಎಚ್ಚರಿಕೆ: {warning_text}",
            "dont_do": "ಮಾಡಬಾರದ ಕೆಲಸಗಳು: {dont_do_text}",
            "voice_intro": "ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ, ನಿಮ್ಮ {crop_name} ಬೆಳೆಗೆ ಪ್ರಮುಖ ಕೃಷಿ ಸಲಹೆ."
        },
        "Bengali": {
            "headline": "🌾 কৃষক পরামর্শ: {crop_name} ফসলে {stress_word}",
            "stress_words": {
                "LOW": "অনুকূল অবস্থা",
                "MODERATE": "মাঝারি চাপ (২ দিনে ব্যবস্থা)",
                "HIGH": "গুরুতর চাপ (আজই পদক্ষেপ প্রয়োজন)",
                "CRITICAL": "জরুরি সতর্কতা (ফসল ক্ষতির আশঙ্কা)"
            },
            "today_action": "আজকের করণীয়: {water_action}. {fert_action_today}.",
            "warning": "সতর্কতা: {warning_text}",
            "dont_do": "যা করবেন না: {dont_do_text}",
            "voice_intro": "নমস্কার কৃষক ভাই ও বোনেরা, আপনার {crop_name} ফসলের জন্য জরুরি পরামর্শ।"
        },
        "Malayalam": {
            "headline": "🌾 കർഷക ഉപദേശം: {crop_name} വിളയിൽ {stress_word}",
            "stress_words": {
                "LOW": "അനുകൂലാവസ്ഥ (സാധാരണ പരിചരണം)",
                "MODERATE": "മിതമായ സമ്മർദ്ദം (2 ദിവസത്തിനകം പരിഹാരം)",
                "HIGH": "ഗുരുതര സമ്മർദ്ദം (ഇന്നുതന്നെ അടിയന്തര നടപടി)",
                "CRITICAL": "അതീവ ഗുരുതരാവസ്ഥ (വിളനാശ ഭീഷണി)"
            },
            "today_action": "ഇന്നത്തെ പ്രധാന പ്രവർത്തനം: {water_action}. {fert_action_today}.",
            "warning": "മുന്നറിയിപ്പ്: {warning_text}",
            "dont_do": "ചെയ്യരുതാത്ത കാര്യങ്ങൾ: {dont_do_text}",
            "voice_intro": "നമസ്കാരം കർഷക സുഹൃത്തേ, നിങ്ങളുടെ {crop_name} വിളയ്ക്കുള്ള സമഗ്ര കൃഷി ഉപദേശം."
        },
        "English": {
            "headline": "🌾 Actionable Farm Advisory: {stress_word} in {crop_name}",
            "stress_words": {
                "LOW": "Optimal Health (Standard Care)",
                "MODERATE": "Moderate Stress (Intervention within 48h)",
                "HIGH": "Severe Stress (Action Required Today)",
                "CRITICAL": "Critical Stress (Imminent Crop Loss Risk)"
            },
            "today_action": "Action Required Today: {water_action}. {fert_action_today}.",
            "warning": "Weather Alert: {warning_text}",
            "dont_do": "Avoid: {dont_do_text}",
            "voice_intro": "Hello Farmer, here is your customized AgriSense advisory for your {crop_name} crop."
        }
    }

    CROP_NAMES = {
        "rice": {"Hindi": "धान / चावल", "Telugu": "వరి", "Tamil": "நெல்", "Malayalam": "നെല്ല്", "Marathi": "भात / धान", "Punjabi": "ਝੋਨਾ", "Gujarati": "ડાંગર", "Kannada": "ಭತ್ತ", "Bengali": "ধান", "English": "Rice"},
        "maize": {"Hindi": "मक्का", "Telugu": "మొక్కజొన్న", "Tamil": "மக்காச்சோளம்", "Malayalam": "ചോളം", "Marathi": "मका", "Punjabi": "ਮੱਕੀ", "Gujarati": "મકાઈ", "Kannada": "ಮೆಕ್ಕೆಜೋಳ", "Bengali": "ভুট্টা", "English": "Maize"},
        "cotton": {"Hindi": "कपास", "Telugu": "పత్తి", "Tamil": "பருத்தி", "Malayalam": "പരുത്തി", "Marathi": "कापूस", "Punjabi": "ਨਰਮਾ/ਕਪਾਹ", "Gujarati": "કપાસ", "Kannada": "ಹತ್ತಿ", "Bengali": "তুলা", "English": "Cotton"},
        "chickpea": {"Hindi": "चना", "Telugu": "శనగలు", "Tamil": "கொண்டைக்கடலை", "Malayalam": "കടല", "Marathi": "हरभरा", "Punjabi": "ਛੋਲੇ", "Gujarati": "ચણા", "Kannada": "ಕಡಲೆ", "Bengali": "ছোলা", "English": "Chickpea"},
        "banana": {"Hindi": "केला", "Telugu": "అరటి", "Tamil": "வாழை", "Malayalam": "വാഴ", "Marathi": "केळी", "Punjabi": "ਕੇਲਾ", "Gujarati": "કેળું", "Kannada": "ಬಾಳೆಹಣ್ಣು", "Bengali": "কলা", "English": "Banana"},
        "tomato": {"Hindi": "टमाटर", "Telugu": "టమోటా", "Tamil": "தக்காளி", "Malayalam": "തക്കാളി", "Marathi": "टोमॅटो", "Punjabi": "ਟਮਾਟਰ", "Gujarati": "ટામેટા", "Kannada": "ಟೊಮೆಟೊ", "Bengali": "টমেটো", "English": "Tomato"}
    }

    def run(
        self,
        language: str = "English",
        crop: str = "rice",
        stress_level: str = "HIGH",
        fertilizer_summary: Optional[Dict[str, Any]] = None,
        water_summary: Optional[Dict[str, Any]] = None,
        wash_off: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """Format simple, regional actionable farm advisory."""
        lang = language.strip().capitalize()
        if lang not in self.TEMPLATES:
            lang = "English"

        tpl = self.TEMPLATES[lang]
        crop_clean = crop.lower().strip()
        crop_display = self.CROP_NAMES.get(crop_clean, {}).get(lang, crop.capitalize())
        stress_word = tpl["stress_words"].get(stress_level.upper(), stress_level)

        f_data = fertilizer_summary or {}
        w_data = water_summary or {}

        urea_kg = f_data.get("urea_kg", f_data.get("per_acre", {}).get("urea_kg", 25.0))
        dap_kg = f_data.get("dap_kg", f_data.get("per_acre", {}).get("dap_kg", 15.0))
        mop_kg = f_data.get("mop_kg", f_data.get("per_acre", {}).get("mop_kg", 10.0))

        water_liters = w_data.get("liters_per_acre", 45000)
        water_depth = w_data.get("net_irrigation_depth_mm", 15.0)

        # Construct localized actions
        if lang == "Hindi":
            water_action = (
                f"खेत में {water_depth} मिमी ({water_liters:,.0f} लीटर/एकड़) सिंचाई ड्रिप या क्यारी विधि से करें"
                if water_depth > 0 else "वर्षा के कारण अतिरिक्त सिंचाई की आवश्यकता नहीं है"
            )
            fert_action = (
                "तेज बारिश के कारण आज कोई खाद न डालें" if wash_off else
                f"प्रति एकड़ {urea_kg} किग्रा यूरिया और {dap_kg} किग्रा डीएपी जड़ के पास डालें"
            )
            warn_txt = "अगले 48 घंटों में भारी बारिश की संभावना है, जल निकासी नालियां खुली रखें।" if wash_off else "दोपहर की तेज धूप में छिड़काव न करें।"
            dont_txt = "गीली मिट्टी में यूरिया का खुला छिड़काव न करें।" if wash_off else "बिना नमी के रासायनिक खाद न डालें।"
        elif lang == "Telugu":
            water_action = f"ఎకరానికి {water_depth} మి.మీ ({water_liters:,.0f} లీటర్లు) తడి అందించండి" if water_depth > 0 else "వర్షం ఉన్నందున నీరు పెట్టవద్దు"
            fert_action = "వర్షం ఉన్నందున ఎరువులు వేయవద్దు" if wash_off else f"ఎకరానికి {urea_kg} కిలోల యూరియా, {dap_kg} కిలోల డీఏపీ వేయండి"
            warn_txt = "రాగల 48 గంటల్లో భారీ వర్ష సూచన." if wash_off else "ఎండ తీవ్రత ఉన్నప్పుడు మందులు పిచికారీ చేయవద్దు."
            dont_txt = "వర్షానికి ముందు రసాయనాలు చల్లవద్దు."
        elif lang == "Tamil":
            water_action = f"ஏக்கருக்கு {water_depth} மி.மீ ({water_liters:,.0f} லிட்டர்) பாசனம் செய்யவும்" if water_depth > 0 else "மழை பெய்ய வாய்ப்புள்ளதால் பாசனம் தேவையில்லை"
            fert_action = "மழை காரணமாக உரமிடுவதை தள்ளிப்போடவும்" if wash_off else f"ஏக்கருக்கு {urea_kg} கிலோ யூரியா மற்றும் {dap_kg} கிலோ டிஏபி இடவும்"
            warn_txt = "அடுத்த 48 மணி நேரத்தில் கனமழை எச்சரிக்கை." if wash_off else "நண்பகல் வெயிலில் தெளிக்க வேண்டாம்."
            dont_txt = "மழைக்கு முன் உரம் தூவ வேண்டாம்."
        elif lang == "Marathi":
            water_action = f"एकरला {water_depth} मिमी ({water_liters:,.0f} लिटर) पाणी द्या" if water_depth > 0 else "पावसामुळे पाणी देण्याची गरज नाही"
            fert_action = "पावसामुळे आज खत टाकू नका" if wash_off else f"एकरला {urea_kg} किलो युरिया आणि {dap_kg} किलो डीएपी द्या"
            warn_txt = "पुढील ४८ तासांत मुसळधार पावसाचा अंदाज." if wash_off else "दुपारच्या उन्हात फवारणी करू नका."
            dont_txt = "पाऊस सुरू असताना खते पसरवू नका."
        elif lang == "Punjabi":
            water_action = f"ਪ੍ਰਤੀ ਏਕੜ {water_depth} ਮਿਲੀਮੀਟਰ ({water_liters:,.0f} ਲੀਟਰ) ਪਾਣੀ ਲਗਾਓ" if water_depth > 0 else "ਮੀਂਹ ਕਾਰਨ ਪਾਣੀ ਲਾਉਣ ਦੀ ਲੋੜ ਨਹੀਂ"
            fert_action = "ਮੀਂਹ ਕਾਰਨ ਖਾਦ ਪਾਉਣਾ ਮੁਲਤਵੀ ਕਰੋ" if wash_off else f"ਪ੍ਰਤੀ ਏਕੜ {urea_kg} ਕਿਲੋ ਯੂਰੀਆ ਅਤੇ {dap_kg} ਕਿਲੋ ਡੀ.ਏ.ਪੀ. ਪਾਓ"
            warn_txt = "ਅਗਲੇ 48 ਘੰਟਿਆਂ ਵਿੱਚ ਭਾਰੀ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ।" if wash_off else "ਦੁਪਹਿਰ ਦੀ ਧੁੱਪ ਵਿੱਚ ਸਪਰੇਅ ਨਾ ਕਰੋ।"
            dont_txt = "ਮੀਂਹ ਤੋਂ ਪਹਿਲਾਂ ਯੂਰੀਆ ਨਾ ਛਿੜਕੋ।"
        elif lang == "Gujarati":
            water_action = f"વીઘા/એકર દીઠ {water_depth} મીમી ({water_liters:,.0f} લિટર) પિયત આપો" if water_depth > 0 else "વરસાદની શક્યતા હોવાથી પિયત આપવાની જરૂર નથી"
            fert_action = "વરસાદના કારણે આજે ખાતર નાખવું નહીં" if wash_off else f"એકર દીઠ {urea_kg} કિલો યુરિયા અને {dap_kg} કિલો ડીએપી આપો"
            warn_txt = "આગામી 48 કલાકમાં ભારે વરસાદની આગાહી." if wash_off else "બપોરના તડકામાં છંટકાવ કરવો નહીં."
            dont_txt = "વરસાદ પહેલા ખાતર છાંટવું નહીં."
        elif lang == "Kannada":
            water_action = f"ಎಕರೆಗೆ {water_depth} ಮಿ.ಮೀ ({water_liters:,.0f} ಲೀಟರ್) ನೀರಾವರಿ ನೀಡಿ" if water_depth > 0 else "ಮಳೆಯ ಕಾರಣ ನೀರುಣಿಸುವ ಅಗತ್ಯವಿಲ್ಲ"
            fert_action = "ಮಳೆಯಿರುವ ಕಾರಣ ಗೊಬ್ಬರ ಹಾಕುವುದನ್ನು ಮುಂದೂಡಿ" if wash_off else f"ಎಕರೆಗೆ {urea_kg} ಕೆಜಿ ಯೂರಿಯಾ ಮತ್ತು {dap_kg} ಕೆಜಿ ಡಿಎಪಿ ಹಾಕಿ"
            warn_txt = "ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ಭಾರೀ ಮಳೆಯ ಮುನ್ಸೂಚನೆ." if wash_off else "ಬಿಸಿಲಿನಲ್ಲಿ ಸಿಂಪಡಿಸಬೇಡಿ."
            dont_txt = "ಮಳೆಯ ಮೊದಲು ರಾಸಾಯನಿಕ ಗೊಬ್ಬರ ಹಾಕಬೇಡಿ."
        elif lang == "Bengali":
            water_action = f"প্রতি একরে {water_depth} মিমি ({water_liters:,.0f} লিটার) সেচ প্রদান করুন" if water_depth > 0 else "বৃষ্টির পূর্বাভাসের কারণে সেচ দেওয়া বন্ধ রাখুন"
            fert_action = "ভারী বৃষ্টির আশঙ্কায় আজ সার প্রয়োগ করবেন না" if wash_off else f"প্রতি একরে {urea_kg} কেজি ইউরিয়া এবং {dap_kg} কেজি ডিএপি প্রয়োগ করুন"
            warn_txt = "আগামী ৪৮ ঘণ্টায় ভারী বৃষ্টির সম্ভাবনা রয়েছে।" if wash_off else "দুপুরের চড়া রোদে কীটনাশক স্প্রে করবেন না।"
            dont_txt = "বৃষ্টির পূর্বে খোলা জমিতে ইউরিয়া ছিটাবেন না।"
        elif lang == "Malayalam":
            water_action = f"ഏക്കറിന് {water_depth} മി.മീ ({water_liters:,.0f} ലിറ്റർ) നനയ്ക്കുക" if water_depth > 0 else "മഴയുള്ളതിനാൽ നനയ്ക്കേണ്ടതില്ല"
            fert_action = "മഴയുള്ളതിനാൽ രാസവളപ്രയോഗം ഒഴിവാക്കുക" if wash_off else f"ഏക്കറിന് {urea_kg} കിലോ യൂറിയയും {dap_kg} കിലോ ഡി.എ.പി.യും നൽകുക"
            warn_txt = "അടുത്ത 48 മണിക്കൂറിൽ കനത്ത മഴയ്ക്ക് സാധ്യത." if wash_off else "ഉച്ചവെയിലിൽ മരുന്ന് തളിക്കരുത്."
            dont_txt = "മഴയ്ക്ക് മുൻപ് വളം വിതറരുത്."
        else:  # English
            water_action = (
                f"Apply {water_depth} mm ({water_liters:,.0f} L/acre) via drip/furrow irrigation"
                if water_depth > 0 else "Rainfall will recharge soil moisture; withhold irrigation"
            )
            fert_action = (
                "HOLD fertilizer: Imminent heavy rain wash-off alert"
                if wash_off else f"Apply {urea_kg} kg Urea and {dap_kg} kg DAP per acre in split doses"
            )
            warn_txt = "Severe precipitation expected within 48h. Maintain field drainage canals." if wash_off else "High evapotranspiration. Irrigate during early morning or evening."
            dont_txt = "Do NOT broadcast nitrogen fertilizer immediately before rainstorms."

        headline = tpl["headline"].format(crop_name=crop_display, stress_word=stress_word)
        today_text = tpl["today_action"].format(water_action=water_action, fert_action_today=fert_action)
        warning_text = tpl["warning"].format(warning_text=warn_txt)
        dont_do_text = tpl["dont_do"].format(dont_do_text=dont_txt)

        voice_script = (
            f"{tpl['voice_intro'].format(crop_name=crop_display)} "
            f"{today_text} {warning_text} {dont_do_text}"
        )

        return {
            "status": "success",
            "language": lang,
            "crop": crop_clean,
            "crop_localized": crop_display,
            "stress_level": stress_level,
            "advisory": {
                "headline": headline,
                "action_today": today_text,
                "warning_weather": warning_text,
                "what_not_to_do": dont_do_text,
                "audio_voice_script": voice_script
            }
        }
