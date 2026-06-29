// ENGL114 core midterm vocabulary — English word (t) -> Arabic meaning (a)
// Edit freely; the quiz, options and counts update automatically.
const DATA = [
  {
    "t": "assume",
    "a": "يفترض"
  },
  {
    "t": "behavior",
    "a": "سلوك"
  },
  {
    "t": "briefly",
    "a": "باختصار"
  },
  {
    "t": "conscious",
    "a": "واعٍ / مُدرِك"
  },
  {
    "t": "effective",
    "a": "فعّال"
  },
  {
    "t": "encounter",
    "a": "لقاء / مواجهة"
  },
  {
    "t": "error",
    "a": "خطأ"
  },
  {
    "t": "expert",
    "a": "خبير"
  },
  {
    "t": "fake",
    "a": "شيء مزيّف / تقليد"
  },
  {
    "t": "form an impression",
    "a": "يكوّن انطباعاً"
  },
  {
    "t": "instinct",
    "a": "غريزة"
  },
  {
    "t": "negative",
    "a": "سلبي"
  },
  {
    "t": "positive",
    "a": "إيجابي"
  },
  {
    "t": "reliable",
    "a": "موثوق / يُعتمد عليه"
  },
  {
    "t": "sample",
    "a": "عيّنة"
  },
  {
    "t": "snap judgment",
    "a": "حكم سريع / متسرّع"
  },
  {
    "t": "suspicious",
    "a": "مُرتاب / مشبوه"
  },
  {
    "t": "trait",
    "a": "سمة / صفة"
  },
  {
    "t": "unconsciously",
    "a": "لا شعورياً / دون وعي"
  },
  {
    "t": "accomplishment",
    "a": "إنجاز"
  },
  {
    "t": "authentic",
    "a": "أصيل / حقيقي"
  },
  {
    "t": "appreciate",
    "a": "يُقدّر"
  },
  {
    "t": "consider",
    "a": "يأخذ في الاعتبار / يعتبر"
  },
  {
    "t": "confidence",
    "a": "ثقة"
  },
  {
    "t": "demonstrate",
    "a": "يُوضّح / يُظهر"
  },
  {
    "t": "expect",
    "a": "يتوقّع"
  },
  {
    "t": "impress",
    "a": "يُثير الإعجاب / يبهر"
  },
  {
    "t": "maintain",
    "a": "يحافظ على"
  },
  {
    "t": "offensive",
    "a": "مُسيء / مهين"
  },
  {
    "t": "professional",
    "a": "محترف / مهني"
  },
  {
    "t": "punctual",
    "a": "دقيق في المواعيد / منضبط"
  },
  {
    "t": "research",
    "a": "بحث"
  },
  {
    "t": "responsible",
    "a": "مسؤول"
  },
  {
    "t": "select",
    "a": "يختار"
  },
  {
    "t": "slang",
    "a": "لغة عامية / دارجة"
  },
  {
    "t": "stranger",
    "a": "شخص غريب"
  },
  {
    "t": "weakness",
    "a": "ضعف / نقطة ضعف"
  },
  {
    "t": "account for",
    "a": "يُفسّر / يُبرّر"
  },
  {
    "t": "a function of",
    "a": "ناتج عن / يعتمد على"
  },
  {
    "t": "approximately",
    "a": "تقريباً"
  },
  {
    "t": "burn",
    "a": "يحرق"
  },
  {
    "t": "consume",
    "a": "يستهلك"
  },
  {
    "t": "correlation",
    "a": "علاقة / ارتباط"
  },
  {
    "t": "degree",
    "a": "درجة"
  },
  {
    "t": "enjoy",
    "a": "يستمتع بـ"
  },
  {
    "t": "ethnic",
    "a": "عِرقي / إثني"
  },
  {
    "t": "experiment",
    "a": "يُجري تجربة / يُجرّب"
  },
  {
    "t": "feature",
    "a": "ميزة / خاصية"
  },
  {
    "t": "illustrate",
    "a": "يُوضّح (بالأمثلة أو الصور)"
  },
  {
    "t": "key",
    "a": "رئيسي / أساسي"
  },
  {
    "t": "local",
    "a": "محلي"
  },
  {
    "t": "play a role in",
    "a": "يلعب دوراً في"
  },
  {
    "t": "rare",
    "a": "نادر"
  },
  {
    "t": "risk",
    "a": "خطر / مخاطرة"
  },
  {
    "t": "season",
    "a": "يُتبّل / يضيف التوابل"
  },
  {
    "t": "spicy",
    "a": "حار / حِرّيف"
  },
  {
    "t": "with respect to",
    "a": "فيما يتعلق بـ"
  },
  {
    "t": "arrange",
    "a": "يُرتّب / يُنظّم"
  },
  {
    "t": "artistic",
    "a": "فنّي"
  },
  {
    "t": "at risk",
    "a": "في خطر / مُعرّض للخطر"
  },
  {
    "t": "balanced",
    "a": "متوازن"
  },
  {
    "t": "be made up of",
    "a": "يتكوّن من / يتألف من"
  },
  {
    "t": "be willing to",
    "a": "يكون مستعداً لـ / راغباً في"
  },
  {
    "t": "identical",
    "a": "متطابق / مماثل تماماً"
  },
  {
    "t": "identify",
    "a": "يُحدّد / يتعرّف على"
  },
  {
    "t": "influence",
    "a": "يؤثّر / تأثير"
  },
  {
    "t": "in terms of",
    "a": "من حيث / فيما يخص"
  },
  {
    "t": "likely",
    "a": "مُحتمَل / من المرجّح"
  },
  {
    "t": "method",
    "a": "طريقة / أسلوب"
  },
  {
    "t": "occasion",
    "a": "مناسبة"
  },
  {
    "t": "principle",
    "a": "مبدأ"
  },
  {
    "t": "recognize",
    "a": "يتعرّف على / يُميّز"
  },
  {
    "t": "sensitive",
    "a": "حسّاس"
  },
  {
    "t": "status symbol",
    "a": "رمز مكانة اجتماعية"
  },
  {
    "t": "system",
    "a": "نظام"
  },
  {
    "t": "typically",
    "a": "عادةً / نموذجياً"
  },
  {
    "t": "as opposed to",
    "a": "على عكس / مقابل"
  },
  {
    "t": "cope",
    "a": "يتأقلم / يتعامل مع"
  },
  {
    "t": "eventually",
    "a": "في النهاية / في نهاية المطاف"
  },
  {
    "t": "exhausted",
    "a": "مُنهَك / مُتعب جداً"
  },
  {
    "t": "firsthand",
    "a": "بشكل مباشر / من المصدر"
  },
  {
    "t": "found",
    "a": "يؤسّس / يُنشئ"
  },
  {
    "t": "informed",
    "a": "مُطّلع / على دراية"
  },
  {
    "t": "permanent",
    "a": "دائم"
  },
  {
    "t": "put together",
    "a": "يُجمّع / يُركّب"
  },
  {
    "t": "quit",
    "a": "يترك / يستقيل"
  },
  {
    "t": "resource",
    "a": "مورد"
  },
  {
    "t": "struggle",
    "a": "يكافح / يُناضل"
  },
  {
    "t": "support (oneself)",
    "a": "يُعيل نفسه / يُنفق على نفسه"
  },
  {
    "t": "turn upside down",
    "a": "يقلب رأساً على عقب"
  },
  {
    "t": "unemployed",
    "a": "عاطل عن العمل"
  },
  {
    "t": "wages",
    "a": "أجور / رواتب"
  },
  {
    "t": "adapt",
    "a": "يتكيّف / يتأقلم"
  },
  {
    "t": "data",
    "a": "بيانات"
  },
  {
    "t": "digital",
    "a": "رقمي"
  },
  {
    "t": "discover",
    "a": "يكتشف"
  },
  {
    "t": "feedback",
    "a": "تغذية راجعة / ملاحظات"
  },
  {
    "t": "global",
    "a": "عالمي"
  },
  {
    "t": "in favor of",
    "a": "لصالح / مؤيّد لـ"
  },
  {
    "t": "interactive",
    "a": "تفاعلي"
  },
  {
    "t": "limitation",
    "a": "قيد / حدّ / محدودية"
  },
  {
    "t": "manufacturer",
    "a": "مُصنّع / الشركة الصانعة"
  },
  {
    "t": "monitor",
    "a": "يراقب / يرصد"
  },
  {
    "t": "obey",
    "a": "يُطيع / يمتثل"
  },
  {
    "t": "obstacle",
    "a": "عائق / عقبة"
  },
  {
    "t": "occur",
    "a": "يحدث / يقع"
  },
  {
    "t": "respond",
    "a": "يستجيب / يردّ"
  },
  {
    "t": "revolutionize",
    "a": "يُحدث ثورة في / يُغيّر جذرياً"
  },
  {
    "t": "sense",
    "a": "يستشعر / يُحسّ بـ"
  },
  {
    "t": "the benefits of",
    "a": "فوائد / منافع"
  },
  {
    "t": "add up to",
    "a": "يبلغ مجموعه / يصل إلى"
  },
  {
    "t": "the bottom line",
    "a": "الخلاصة / النتيجة النهائية"
  },
  {
    "t": "character",
    "a": "شخصية / طبع"
  },
  {
    "t": "claim",
    "a": "ادّعاء / زعم"
  },
  {
    "t": "criticize",
    "a": "ينتقد"
  },
  {
    "t": "disappear",
    "a": "يختفي"
  },
  {
    "t": "evidence",
    "a": "دليل / برهان"
  },
  {
    "t": "give in",
    "a": "يستسلم / يرضخ"
  },
  {
    "t": "infer",
    "a": "يستنتج"
  },
  {
    "t": "introduce",
    "a": "يُقدّم / يُعرّف بـ"
  },
  {
    "t": "merchandise",
    "a": "بضائع / سلع"
  },
  {
    "t": "personal",
    "a": "شخصي"
  },
  {
    "t": "regulate",
    "a": "يُنظّم / يضبط"
  },
  {
    "t": "scenario",
    "a": "سيناريو / احتمال"
  },
  {
    "t": "take into account",
    "a": "يأخذ في الاعتبار / يضع في الحسبان"
  },
  {
    "t": "taste",
    "a": "ذوق / مذاق"
  },
  {
    "t": "uncomfortable",
    "a": "غير مريح"
  },
  {
    "t": "worldwide",
    "a": "عالمي / على مستوى العالم"
  },
  {
    "t": "willingness",
    "a": "استعداد / رغبة"
  },
  {
    "t": "accurate",
    "a": "دقيق"
  },
  {
    "t": "acknowledge",
    "a": "يعترف بـ / يُقرّ بـ"
  },
  {
    "t": "annoying",
    "a": "مُزعج"
  },
  {
    "t": "annual",
    "a": "سنوي"
  },
  {
    "t": "broadcasting",
    "a": "بثّ / إذاعة"
  },
  {
    "t": "donation",
    "a": "تبرّع"
  },
  {
    "t": "entertain",
    "a": "يُسلّي / يُرفّه"
  },
  {
    "t": "exposure",
    "a": "تعرّض / انكشاف"
  },
  {
    "t": "factor",
    "a": "عامل"
  },
  {
    "t": "impact",
    "a": "تأثير / أثر"
  },
  {
    "t": "imply",
    "a": "يُلمّح / يعني ضمناً"
  },
  {
    "t": "memorable",
    "a": "لا يُنسى / جدير بالتذكّر"
  },
  {
    "t": "reflect",
    "a": "يعكس / يُعبّر عن"
  },
  {
    "t": "relevant",
    "a": "ذو صلة / وثيق الصلة"
  },
  {
    "t": "specifically",
    "a": "تحديداً / على وجه التحديد"
  },
  {
    "t": "suggest",
    "a": "يقترح / يشير إلى"
  },
  {
    "t": "support",
    "a": "يدعم / يؤيّد"
  },
  {
    "t": "surrounding",
    "a": "مُحيط"
  },
  {
    "t": "cycle",
    "a": "دورة"
  },
  {
    "t": "decline",
    "a": "ينخفض / يتراجع"
  },
  {
    "t": "development",
    "a": "تطوّر / تنمية"
  },
  {
    "t": "encourage",
    "a": "يُشجّع"
  },
  {
    "t": "explore",
    "a": "يستكشف"
  },
  {
    "t": "financial",
    "a": "مالي"
  },
  {
    "t": "growth",
    "a": "نمو"
  },
  {
    "t": "invention",
    "a": "اختراع"
  },
  {
    "t": "investigate",
    "a": "يُحقّق في / يبحث"
  },
  {
    "t": "judgment",
    "a": "حُكم / تقدير"
  },
  {
    "t": "locate",
    "a": "يُحدّد موقع / يعثر على"
  },
  {
    "t": "mystery",
    "a": "لغز / غموض"
  },
  {
    "t": "previous",
    "a": "سابق"
  },
  {
    "t": "prove",
    "a": "يُثبت / يبرهن"
  },
  {
    "t": "reputation",
    "a": "سُمعة"
  },
  {
    "t": "retire",
    "a": "يتقاعد"
  },
  {
    "t": "solve",
    "a": "يحلّ"
  },
  {
    "t": "survival",
    "a": "بقاء / نجاة"
  },
  {
    "t": "tendency",
    "a": "ميل / نزعة"
  },
  {
    "t": "bravely",
    "a": "بشجاعة"
  },
  {
    "t": "conquer",
    "a": "يغزو / يقهر / ينتصر على"
  },
  {
    "t": "determined",
    "a": "مُصمّم / عازم"
  },
  {
    "t": "distinctive",
    "a": "مُميّز / فريد"
  },
  {
    "t": "earn",
    "a": "يكسب / يحصل على أجر"
  },
  {
    "t": "element",
    "a": "عنصر"
  },
  {
    "t": "emerge",
    "a": "يظهر / يبرز"
  },
  {
    "t": "enable",
    "a": "يُمكّن / يُتيح"
  },
  {
    "t": "goal",
    "a": "هدف"
  },
  {
    "t": "perceive",
    "a": "يُدرك / يتصوّر"
  },
  {
    "t": "poverty",
    "a": "فقر"
  },
  {
    "t": "predict",
    "a": "يتنبّأ / يتوقّع"
  },
  {
    "t": "role",
    "a": "دور"
  },
  {
    "t": "set apart",
    "a": "يُميّز / يُفرد"
  },
  {
    "t": "significant",
    "a": "مهمّ / ذو دلالة"
  },
  {
    "t": "threat",
    "a": "تهديد / خطر"
  },
  {
    "t": "traumatic",
    "a": "صادم / مؤلم نفسياً"
  },
  {
    "t": "ultimate",
    "a": "نهائي / أقصى / الأسمى"
  }
];
