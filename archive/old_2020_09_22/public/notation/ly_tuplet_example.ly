\version "2.18.2"
\paper{
  paper-width =150
}
  
       
\score {
  
  <<
    
   \override Score.BarNumber.break-visibility = ##(#f #f #f)
    
  \new RhythmicStaff \with {
    \omit TimeSignature
    \omit BarLine
    \omit Clef
    \omit KeySignature
  } 
  
  {
    \time 1/4
    \override TupletBracket.bracket-visibility = ##t
    \set tupletFullLength = ##t
    \override NoteHead.font-size = #-1
    \override Stem.details.beamed-lengths = #'(5)
    \override Stem.details.lengths = #'(5)
   
    
    %d8
     \once \override TupletNumber #'text = "7:4" 
    \tuplet 7/4 {d16 [d d d d d d]}
    %d16 d d d
    %d8 [d] 
  }
  
  >>
  

  \layout{ 
    \context {
      \Score
        proportionalNotationDuration = #(ly:make-moment 1/128)   
        \override SpacingSpanner.uniform-stretching = ##t
        \override SpacingSpanner.strict-note-spacing = ##t
        \override SpacingSpanner.strict-grace-spacing = ##t
        \override Beam.breakable = ##t
        \override Glissando.breakable = ##t
        \override TextSpanner.breakable = ##t
    }
    
    indent = 0
    line-width = 25     
  }
  
  \midi{}

}
