import { h } from 'vue'
import ATL from '@/assets/NBA/ATL.png'
import BKN from '@/assets/NBA/BKN.png'
import BOS from '@/assets/NBA/BOS.png'
import CHA from '@/assets/NBA/CHA.png'
import CHI from '@/assets/NBA/CHI.png'
import CLE from '@/assets/NBA/CLE.png'
import DAL from '@/assets/NBA/DAL.png'
import DEN from '@/assets/NBA/DEN.png'
import DET from '@/assets/NBA/DET.png'
import GSW from '@/assets/NBA/GSW.png'
import HOU from '@/assets/NBA/HOU.png'
import IND from '@/assets/NBA/IND.png'
import LAC from '@/assets/NBA/LAC.png'
import LAL from '@/assets/NBA/LAL.png'
import MEM from '@/assets/NBA/MEM.png'
import MIA from '@/assets/NBA/MIA.png'
import MIL from '@/assets/NBA/MIL.png'
import MIN from '@/assets/NBA/MIN.png'
import NOP from '@/assets/NBA/NOP.png'
import NYK from '@/assets/NBA/NYK.png'
import OKC from '@/assets/NBA/OKC.png'
import ORL from '@/assets/NBA/ORL.png'
import PHI from '@/assets/NBA/PHI.png'
import PHO from '@/assets/NBA/PHO.png'
import SAC from '@/assets/NBA/SAC.png'
import SAS from '@/assets/NBA/SAS.png'
import TOR from '@/assets/NBA/TOR.png'
import UTA from '@/assets/NBA/UTA.png'
import WAS from '@/assets/NBA/WAS.png'
import POR from '@/assets/NBA/POR.png'

export function useLogoProvider() {
  const nameToLogoUrl = {
    ATL, BKN, BOS, CHA, CHI, CLE, DAL, DEN, DET, GSW, HOU, IND, LAC, LAL, MEM, MIA, MIL, MIN, NOP, NYK, OKC, ORL, PHI, PHO, SAC, SAS, TOR, UTA, WAS, POR, 'NY': NYK, 'GS': GSW, 'PHX': PHO, 'SA' : SAS, 'NO': NOP,
  }

  const getLogo = (team) => {
    return h(
      'img',
      { 
        'src': nameToLogoUrl[team],
        'alt': team,
        style: 'width: 1.5rem'
      },
    )
  }

  return { getLogo }
}