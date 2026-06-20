import type { Dictionary } from '@asicupv/paella-core';
import enUS from './en-US.json';
import esES from './es-ES.json';
import caES from './ca-ES.json';


const defaultDictionaries: Record<string, Dictionary> = {};


defaultDictionaries['en-US'] = enUS;
defaultDictionaries['en'] = enUS;
defaultDictionaries['es-ES'] = esES;
defaultDictionaries['es'] = esES;
defaultDictionaries['ca-ES'] = caES;
defaultDictionaries['ca'] = caES;

export default defaultDictionaries;
