import { GameId, Language } from '../types/game';

export interface GameTranslation {
  title: string;
  shortDesc: string;
  instruction: string;
}

export interface TranslationBundle {
  brandName: string;
  titleTagline: string;
  titleSubtitle: string;
  playAsGuest: string;
  signInGoogle: string;
  signingIn: string;
  controlHint: string;
  hubHeading: string;
  hubSubheading: string;
  totalScore: string;
  levelsCompleted: string;
  achievementsTitle: string;
  achievementsSubtitle: string;
  achievementsUnlocked: string;
  achievementPoints: string;
  overall: string;
  globalAchievements: string;
  levelMilestone: string;
  totalLevelsMilestone: string;
  newAchievements: string;
  achievementBonus: string;
  unlockedLabel: string;
  levelLabel: string;
  ofMax: string;
  guestMode: string;
  cloudSynced: string;
  settingsTitle: string;
  languageLabel: string;
  musicLabel: string;
  sfxLabel: string;
  onLabel: string;
  offLabel: string;
  accountLabel: string;
  signOut: string;
  close: string;
  back: string;
  restart: string;
  undo: string;
  hint: string;
  hintLoading: string;
  hintFallback: string;
  movesLabel: string;
  timeLabel: string;
  roundLabel: string;
  pairsLabel: string;
  watchTurn: string;
  yourTurn: string;
  rotatePiece: string;
  clearPiece: string;
  selectLevel: string;
  victoryTitle: string;
  victorySubtitle: string;
  scoreEarned: string;
  nextLevel: string;
  backToHub: string;
  allLevelsDone: string;
  authErrorPopup: string;
  games: Record<GameId, GameTranslation>;
}

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  kk: {
    brandName: 'BalaMind',
    titleTagline: 'Ойлан, тап, жеңіске жет!',
    titleSubtitle: 'Балалар мен жасөспірімдерге арналған 9 басқатырғыш және 1000 деңгей',
    playAsGuest: 'Қонақ ретінде ойнау',
    signInGoogle: 'Google арқылы кіру',
    signingIn: 'Кіруде...',
    controlHint: 'Түрту немесе пернетақта арқылы басқарыңыз · Барлық 9 ойын қолжетімді',
    hubHeading: 'Ойындар әлемі',
    hubSubheading: 'Кез келген басқатырғышты таңдап, деңгейлерді бағындыр',
    totalScore: 'Жалпы ұпай',
    levelsCompleted: 'Өткен деңгейлер',
    achievementsTitle: 'Жетістіктер',
    achievementsSubtitle: 'Әр маңызды деңгейде жаңа марапат пен ұпай ашылады',
    achievementsUnlocked: 'Ашылған марапат',
    achievementPoints: 'Жетістік ұпайлары',
    overall: 'Жалпы',
    globalAchievements: 'Барлық ойындар бойынша',
    levelMilestone: '{n}-деңгей марапаты',
    totalLevelsMilestone: 'Сіз {n} деңгейді өттіңіз!',
    newAchievements: 'Жаңа жетістік!',
    achievementBonus: 'Жетістік бонусы',
    unlockedLabel: 'Ашылды',
    levelLabel: 'Деңгей',
    ofMax: '/ 1000',
    guestMode: 'Қонақ режимі (жергілікті сақтау)',
    cloudSynced: 'Google бұлттық сақтау қосулы',
    settingsTitle: 'Баптаулар',
    languageLabel: 'Тілді таңдау',
    musicLabel: 'Фондық әуен',
    sfxLabel: 'Дыбыс эффектілері',
    onLabel: 'Қосулы',
    offLabel: 'Өшірулі',
    accountLabel: 'Аккаунт',
    signOut: 'Шығу',
    back: 'Артқа',
    close: 'Жабу',
    restart: 'Қайта бастау',
    undo: 'Болдырмау',
    hint: 'Кеңес',
    hintLoading: 'Ойлануда...',
    hintFallback: 'Кіші қадамдармен алға жылжып, заңдылықты тексеріңіз!',
    movesLabel: 'Қадам',
    timeLabel: 'Уақыт',
    roundLabel: 'Раунд',
    pairsLabel: 'Жұп',
    watchTurn: 'Мұқият қара...',
    yourTurn: 'Енді сенің кезегің!',
    rotatePiece: 'Бұру 90°',
    clearPiece: 'Тазалау',
    selectLevel: 'Деңгейді таңдау',
    victoryTitle: 'Тамаша! Деңгей өтілді!',
    victorySubtitle: 'Сен нағыз зерек ойыншысың!',
    scoreEarned: 'Жиналған ұпай',
    nextLevel: 'Келесі деңгей',
    backToHub: 'Басты менюге',
    allLevelsDone: 'Барлық 1000 деңгей аяқталды!',
    authErrorPopup: 'Google кіру терезесі жабылды немесе бұғатталды. Қайта байқап көріңіз.',
    games: {
      memory: {
        title: 'Жад карталары',
        shortDesc: 'Бірдей жұп суреттерді тап',
        instruction: 'Карталарды ашып, барлық бірдей жұптарды табыңыз.',
      },
      numberSlide: {
        title: 'Сандар тізбегі',
        shortDesc: 'Сандарды өсу ретімен қой',
        instruction: 'Бос орынға жақын санды түртіп, 1-ден бастап ретімен жинаңыз.',
      },
      colorSort: {
        title: 'Түстерді сұрыптау',
        shortDesc: 'Түстерді түтікшелерге бөл',
        instruction: 'Түтікшені түртіп, сұйықтықты бос немесе түсі бірдей түтікшеге құйыңыз.',
      },
      maze: {
        title: 'Лабиринт',
        shortDesc: 'Кейіпкерді шығар жолға жеткіз',
        instruction: 'Бағыт түймелерін немесе сырғытуды қолданып, жұлдызға жетіңіз.',
      },
      simon: {
        title: 'Саймон айтады',
        shortDesc: 'Жарық пен дыбыс ретін қайтала',
        instruction: 'Жанған түстердің ретін есте сақтап, дәл солай басыңыз.',
      },
      connectDots: {
        title: 'Жұптарды қосу',
        shortDesc: 'Түсті нүктелерді сызықпен қос',
        instruction: 'Түсі бірдей нүктелерді сызықтарды қиылыстырмай қосыңыз.',
      },
      mathGrid: {
        title: 'Математикалық басқатырғыш',
        shortDesc: 'Бос орындарға дұрыс сан қой',
        instruction: 'Бос торкөзді таңдап, төменнен дұрыс санды қойыңыз.',
      },
      tangram: {
        title: 'Сиқырлы пазл',
        shortDesc: 'Фигураларды орындарына орналастыр',
        instruction: 'Фигураны таңдап, қажет болса бұрып, торкөзге орналастырыңыз.',
      },
      oddOneOut: {
        title: 'Жылдам реакция',
        shortDesc: 'Өзгеше элементті тез тап',
        instruction: 'Тордағы басқалардан ерекшеленетін бір элементті түртіңіз.',
      },
    },
  },
  ru: {
    brandName: 'BalaMind',
    titleTagline: 'Думай, играй, побеждай!',
    titleSubtitle: '9 развивающих головоломок и 1000 уровней для детей и подростков',
    playAsGuest: 'Играть как гость',
    signInGoogle: 'Войти через Google',
    signingIn: 'Вход...',
    controlHint: 'Сенсорное управление и клавиатура · Все 9 игр открыты',
    hubHeading: 'Мир головоломок',
    hubSubheading: 'Выбирай любую игру и покоряй 1000 уровней',
    totalScore: 'Общий счёт',
    levelsCompleted: 'Пройдено уровней',
    achievementsTitle: 'Достижения',
    achievementsSubtitle: 'Каждый важный уровень открывает новую награду и очки',
    achievementsUnlocked: 'Открыто наград',
    achievementPoints: 'Очки достижений',
    overall: 'Общее',
    globalAchievements: 'По всем играм',
    levelMilestone: 'Награда за {n}-й уровень',
    totalLevelsMilestone: 'Вы прошли {n} уровней!',
    newAchievements: 'Новое достижение!',
    achievementBonus: 'Бонус за достижение',
    unlockedLabel: 'Открыто',
    levelLabel: 'Уровень',
    ofMax: '/ 1000',
    guestMode: 'Гостевой режим (локально)',
    cloudSynced: 'Облако Google подключено',
    settingsTitle: 'Настройки',
    languageLabel: 'Язык игры',
    musicLabel: 'Фоновая музыка',
    sfxLabel: 'Звуковые эффекты',
    onLabel: 'Вкл',
    offLabel: 'Выкл',
    accountLabel: 'Аккаунт',
    signOut: 'Выйти',
    back: 'Назад',
    close: 'Закрыть',
    restart: 'Заново',
    undo: 'Отмена',
    hint: 'Подсказка',
    hintLoading: 'Думаю...',
    hintFallback: 'Проверьте доступные ходы и двигайтесь шаг за шагом!',
    movesLabel: 'Ходы',
    timeLabel: 'Время',
    roundLabel: 'Раунд',
    pairsLabel: 'Пары',
    watchTurn: 'Смотри внимательно...',
    yourTurn: 'Твой ход!',
    rotatePiece: 'Повернуть 90°',
    clearPiece: 'Снять',
    selectLevel: 'Выбор уровня',
    victoryTitle: 'Отлично! Уровень пройден!',
    victorySubtitle: 'Ты настоящий мастер логики!',
    scoreEarned: 'Заработано очков',
    nextLevel: 'Следующий уровень',
    backToHub: 'В меню игр',
    allLevelsDone: 'Все 1000 уровней пройдены!',
    authErrorPopup: 'Окно входа Google закрыто или заблокировано. Попробуйте ещё раз.',
    games: {
      memory: {
        title: 'Карточки памяти',
        shortDesc: 'Найди все одинаковые пары',
        instruction: 'Открывай карточки и находи совпадения.',
      },
      numberSlide: {
        title: 'Пятнашки',
        shortDesc: 'Собери числа по порядку',
        instruction: 'Нажимай на числа рядом с пустой клеткой, чтобы выстроить их от 1.',
      },
      colorSort: {
        title: 'Сортировка цветов',
        shortDesc: 'Раздели цвета по пробиркам',
        instruction: 'Переливай жидкость в пустую пробирку или на такой же верхний цвет.',
      },
      maze: {
        title: 'Лабиринт',
        shortDesc: 'Найди выход к финишу',
        instruction: 'Используй кнопки направления или свайпы, чтобы дойти до звезды.',
      },
      simon: {
        title: 'Саймон говорит',
        shortDesc: 'Повтори световой порядок',
        instruction: 'Запомни последовательность сигналов и повтори её точно так же.',
      },
      connectDots: {
        title: 'Соедини точки',
        shortDesc: 'Свяжи пары линиями',
        instruction: 'Проведи линии между точками одного цвета, не пересекая пути.',
      },
      mathGrid: {
        title: 'Математическая сетка',
        shortDesc: 'Заполни пропуски в примерах',
        instruction: 'Выбери пустую клетку и вставь подходящее число снизу.',
      },
      tangram: {
        title: 'Волшебный пазл',
        shortDesc: 'Собери фигуры в рамку',
        instruction: 'Выбери фигуру, при необходимости поверни её и поставь на поле.',
      },
      oddOneOut: {
        title: 'Быстрая реакция',
        shortDesc: 'Найди лишний элемент',
        instruction: 'Нажми на единственную фигуру, которая отличается от остальных.',
      },
    },
  },
  en: {
    brandName: 'BalaMind',
    titleTagline: 'Think, play, and level up!',
    titleSubtitle: '9 brain-boosting puzzle games with 1000 procedural levels each',
    playAsGuest: 'Play as Guest',
    signInGoogle: 'Sign in with Google',
    signingIn: 'Signing in...',
    controlHint: 'Touch-friendly & keyboard ready · All 9 puzzles unlocked',
    hubHeading: 'Puzzle World',
    hubSubheading: 'Pick any puzzle game and climb through 1,000 levels',
    totalScore: 'Total Score',
    levelsCompleted: 'Levels Cleared',
    achievementsTitle: 'Achievements',
    achievementsSubtitle: 'Every milestone unlocks a brand-new badge and points',
    achievementsUnlocked: 'Badges Unlocked',
    achievementPoints: 'Achievement Points',
    overall: 'Overall',
    globalAchievements: 'Across All Games',
    levelMilestone: 'Level {n} Badge',
    totalLevelsMilestone: 'You cleared {n} levels!',
    newAchievements: 'New Achievement!',
    achievementBonus: 'Achievement Bonus',
    unlockedLabel: 'Unlocked',
    levelLabel: 'Level',
    ofMax: '/ 1000',
    guestMode: 'Guest Mode (saved locally)',
    cloudSynced: 'Cloud Sync Active',
    settingsTitle: 'Settings',
    languageLabel: 'Language',
    musicLabel: 'Background Music',
    sfxLabel: 'Sound Effects',
    onLabel: 'On',
    offLabel: 'Off',
    accountLabel: 'Account',
    signOut: 'Sign Out',
    back: 'Back',
    close: 'Close',
    restart: 'Restart',
    undo: 'Undo',
    hint: 'Hint',
    hintLoading: 'Thinking...',
    hintFallback: 'Look closely at the pattern and take one small step at a time!',
    movesLabel: 'Moves',
    timeLabel: 'Time',
    roundLabel: 'Round',
    pairsLabel: 'Pairs',
    watchTurn: 'Watch carefully...',
    yourTurn: 'Your turn!',
    rotatePiece: 'Rotate 90°',
    clearPiece: 'Remove',
    selectLevel: 'Select Level',
    victoryTitle: 'Awesome! Level Complete!',
    victorySubtitle: 'Sharp thinking and great focus!',
    scoreEarned: 'Score Earned',
    nextLevel: 'Next Level',
    backToHub: 'All Games',
    allLevelsDone: 'All 1,000 levels completed!',
    authErrorPopup: 'Google sign-in popup was closed or blocked. Please try again.',
    games: {
      memory: {
        title: 'Memory Match',
        shortDesc: 'Flip cards & match pairs',
        instruction: 'Tap cards to flip them and match every pair.',
      },
      numberSlide: {
        title: 'Number Slide',
        shortDesc: 'Slide tiles into order',
        instruction: 'Tap tiles next to the empty slot to arrange numbers from 1 upward.',
      },
      colorSort: {
        title: 'Color Sort',
        shortDesc: 'Sort colors into tubes',
        instruction: 'Pour top liquid into an empty tube or onto a matching color.',
      },
      maze: {
        title: 'Maze Runner',
        shortDesc: 'Guide hero to the exit',
        instruction: 'Use the arrow pad, swipe, or arrow keys to reach the star.',
      },
      simon: {
        title: 'Simon Says',
        shortDesc: 'Repeat light & sound order',
        instruction: 'Watch the glowing sequence and tap the pads in the exact order.',
      },
      connectDots: {
        title: 'Connect the Dots',
        shortDesc: 'Link matching color dots',
        instruction: 'Draw non-overlapping paths between each matching pair of dots.',
      },
      mathGrid: {
        title: 'Math Grid',
        shortDesc: 'Solve intersecting equations',
        instruction: 'Select an empty box and tap the right number tile below.',
      },
      tangram: {
        title: 'Magic Tangram',
        shortDesc: 'Fit shapes into the board',
        instruction: 'Select a shape, rotate if needed, and tap the board to place it.',
      },
      oddOneOut: {
        title: 'Odd One Out',
        shortDesc: 'Spot the different tile fast',
        instruction: 'Tap the single item in the grid that looks different from the rest.',
      },
    },
  },
};
