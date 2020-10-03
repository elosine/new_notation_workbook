\version "2.18.2"
\paper{
  paper-width =50
}
  
       
\score {
  <<
  \new RhythmicStaff \with {
    \omit TimeSignature
    \omit BarLine
  } 
  {
    \time 1/4
    \clef treble
      \tuplet 7/1 {d16 [d d d d d d]}
  }
  
  >>

  \layout{ 
    indent = 0
    line-width = 50     
  }
  
  \midi{}

}
