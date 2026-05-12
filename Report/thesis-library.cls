% thesis-library.cls - ASU Master's Thesis class
% Based on the provided Masters.sty file

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{thesis-library}[Master's Thesis class]

\LoadClass[12pt,a4paper]{report}

% Required packages
\usepackage[T1]{fontenc}
\usepackage{mathptmx}
\usepackage{titlesec}
\usepackage{graphicx}
\usepackage[acronym]{glossaries}
\usepackage{fmtcount}
\usepackage{lastpage}

\usepackage{fancyhdr}
\usepackage{etoolbox}
\usepackage{setspace}
\usepackage{ragged2e}
\usepackage{caption}
\usepackage{xurl}

\usepackage{geometry}

% -------------------------------------------------------
% Table support: tabularx + properly defined column types
% -------------------------------------------------------
\usepackage{tabularx}
\usepackage{array}

% L  – left-aligned ragged-right stretchy column (replaces bare X so text
%       wraps cleanly without inter-word spacing issues)
\newcolumntype{L}{>{\RaggedRight\arraybackslash}X}

% R  – right-aligned stretchy column
\newcolumntype{R}{>{\raggedleft\arraybackslash}X}

% C  – centred stretchy column
\newcolumntype{C}{>{\centering\arraybackslash}X}

% P{w} – fixed-width left-aligned paragraph column (replaces the
%          centred \newcolumntype{P} that caused the alignment mess)
\newcolumntype{P}[1]{>{\RaggedRight\arraybackslash}p{#1}}

% -------------------------------------------------------

% Add the set space package and enable double spacing
\doublespacing
\setlength{\emergencystretch}{2em}

% Enforce full justification (both-side alignment) for body text.
\AtBeginDocument{\justifying}

% Keep floats centered; use centered captions for tables.
\AtBeginEnvironment{figure}{\centering}
\AtBeginEnvironment{table}{\centering}
\AfterEndEnvironment{figure}{\par\justifying}
\AfterEndEnvironment{table}{\par\justifying}
\captionsetup[figure]{justification=centering,singlelinecheck=false}
\captionsetup[table]{justification=centering,singlelinecheck=false}


% Margins
\setlength{\headheight}{32.26pt}
\setlength{\textwidth}{16cm}
\setlength{\textheight}{23cm}
\setlength{\oddsidemargin}{0.5cm}
\setlength{\evensidemargin}{0.5cm}
\setlength{\topmargin}{-1cm}


% Section headings
\titleformat{\chapter}[display]
{\normalfont\huge\bfseries\filcenter}{\chaptertitlename\ \thechapter}{20pt}{\Huge}


\titlespacing*{\chapter}{0pt}{-80pt}{40pt}
\titleformat{\section}
{\normalfont\Large\bfseries}{\thesection}{1em}{}
\titleformat{\subsection}
{\normalfont\large\bfseries}{\thesubsection}{1em}{}

% Table of contents
\renewcommand{\contentsname}{Table of Contents}
\setcounter{tocdepth}{2}
\setcounter{secnumdepth}{3}

% List of Abbreviations
\newcommand{\listofabbreviations}{
  \printglossary[type=\acronymtype, title=List of Abbreviations, toctitle=List of Abbreviations,nonumberlist]
}
\makeglossaries
\newcommand{\clearemptydoublepage}{
  \thispagestyle{empty}
  \mbox{}
}


% Document information
\providecommand{\subtitle}{}
\providecommand{\studentAcaYear}{}
\providecommand{\coSupervisorLabel}{}
\providecommand{\cosupervisorName}{}
\providecommand{\cosupervisorDesig}{}
\providecommand{\cosupervisorAff}{}
\providecommand{\facultyName}{}

\newcommand{\universitylogo}{%
  \IfFileExists{images/JUST_logo_transparent.png}{%
    \includegraphics[width=3cm]{images/JUST_logo_transparent.png}%
  }{%
    \fbox{\parbox[c][2.5cm][c]{3cm}{\centering JUST Logo}}%
  }%
}
\newcommand{\titleA}{\thesisTitle}
\newcommand{\titleB}{\subtitle}
\newcommand{\by}{\byLabel}
\newcommand{\authorname}{\studentName}
\newcommand{\authorsign}{\studentSign}
\newcommand{\supervisorsign}{\supervisorSign}
\newcommand{\cosupervisorsign}{\cosupervisorSign}
\newcommand{\authorid}{\studentID}
\newcommand{\authorregyear}{\studentRegYear}
\newcommand{\authoracayear}{\studentAcaYear}
\newcommand{\supervisor}{\supervisorLabel}
\newcommand{\supervisorNameStyle}{\supervisorName}
\newcommand{\supervisorDesigStyle}{\supervisorDesig}
\newcommand{\supervisorAffStyle}{\supervisorAff}
\newcommand{\cosupervisor}{\coSupervisorLabel}
\newcommand{\cosupervisorNameStyle}{\cosupervisorName}
\newcommand{\cosupervisorDesigStyle}{\cosupervisorDesig}
\newcommand{\cosupervisorAffStyle}{\cosupervisorAff}
\newcommand{\degreeLineA}{\degreeLineALabel}
\newcommand{\degreeLineB}{\degreeLineBLabel}
\newcommand{\major}{\majorName}
\newcommand{\faculty}{\facultyName}
\newcommand{\university}{\universityName}
\newcommand{\region}{\regionName}
\newcommand{\approvaltext}{\approvalText}
\newcommand{\degreeyear}{\degreeyearName}
\newcommand{\degreemonth}{\degreemonthName}


% Cover page
\newcommand{\printline}[2][0.0cm]{%
  \setbox0=\hbox{#2}%
  \ifdim\wd0>0pt
    #2\\[#1]%
  \fi
}

\newcommand{\makecoverpage}{
\newgeometry{left=2cm,right=2cm,top=2cm,bottom=-2cm}
\begin{titlepage}
\begin{center}
    \printline[0.25cm]{\Large \textbf{\university}}
    \printline[0.25cm]{\large \region}
    {\universitylogo}\\[1cm]
    \printline[0.3cm]{\Large \textbf{\titleA}}
    \printline[0.3cm]{\Large \textbf{\titleB}}
    \printline[0.0cm]{\large \textbf{\by}}
    \printline[0.1cm]{\large \authorname}
    \printline[0.0cm]{\large \authorid}
    \printline[0.0cm]{\large \authorregyear}
    \printline[0.5cm]{\large \authoracayear}
    \printline[0.0cm]{\large \textbf{\supervisor}}
    \printline[0.0cm]{\large \supervisorNameStyle}
    \printline[0.0cm]{\large \supervisorDesigStyle}
    \printline[0.5cm]{\large \supervisorAffStyle}
    \printline[0.0cm]{\large \textbf{\cosupervisor}}
    \printline[0.0cm]{\large \cosupervisorNameStyle}
    \printline[0.0cm]{\large \cosupervisorDesigStyle}
    \printline[0.5cm]{\large \cosupervisorAffStyle}
    \printline[0.0cm]{\large \degreeLineA}
    \printline[0.0cm]{\large \degreeLineB}
    \printline[0.0cm]{\large \major}
    \printline[0.1cm]{\large \textbf{\faculty}}
    {\par\noindent\rule{\textwidth}{1pt}}\\[0.1cm]
    {\large \textbf{\degreemonth~\degreeyear}}
\end{center}
\end{titlepage}
\restoregeometry
}

% Approval page
\newcommand{\makeapprovalpage}{
\begin{titlepage}
\begin{center}
\printline[0.1cm]{\LARGE \university}
\printline[1cm]{\large \region}
{\universitylogo}\\[0.5cm]
\printline[0.5cm]{\approvaltext}
\printline[1cm]{\authorsign}
{\par\noindent\rule{0.5\textwidth}{1pt}}\\[0.0cm]
\printline[1cm]{\authorname}

\printline[1cm]{\supervisorsign}
{\par\noindent\rule{0.5\textwidth}{1pt}}\\[0.0cm]
\printline[1cm]{\supervisorNameStyle}

\end{center}
\end{titlepage}
}

% Print Chapter Title
\newcommand{\printchaptertitle}[1]{
  \cleardoublepage
  \pagestyle{empty}
  \refstepcounter{chapter}
  \edef\currentchapternumber{\thechapter}
  \edef\currentchaptertitle{\chaptername\ \thechapter: #1}
  \vspace*{\fill}
  \begin{center}
    \huge\textbf{\chaptername\ \thechapter\\[1ex] #1}
  \end{center}
  \vspace*{\fill}
  \cleardoublepage
  \thispagestyle{firstcontentpage}
  \addcontentsline{toc}{chapter}{\chaptername\ \thechapter: #1}

  \pagestyle{fancy}
  \fancyhf{}
  \fancyfoot[C]{Page \thepage \hspace{1pt} of \pageref{LastPage}}
}

\fancypagestyle{firstcontentpage}{
  \fancyhf{}
  \lhead{\textbf{\Large \currentchaptertitle} \\\vspace{1.5pt}}
  \renewcommand{\headrulewidth}{0.2pt}
  \fancyfoot[C]{Page \thepage \hspace{1pt} of \pageref{LastPage}}
}

\fancypagestyle{fancy}{
  \fancyhf{}
  \renewcommand{\headrulewidth}{0.0pt}
  \fancyfoot[C]{Page \thepage \hspace{1pt} of \pageref{LastPage}}
}