import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';


export default class PTColumnDef extends ColumnDef {

  constructor({
    aggFunc,
    render,
    ...props
  }) {
    const aggRender = (data, ...args) => {
      const aggData = aggFunc ? aggFunc(data, ...args) : data;
      return render ? render(aggData, ...args) : aggData;
    };
    super({render: aggRender, ...props});
  }

}
