declare module 'flux' {
  declare class Dispatcher {
    dispatch: (data: {type: string}) => void;
    register: (func: (data: {type: string}) => void) => void;
  }
}
