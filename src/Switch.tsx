import React, {FunctionComponent} from 'react'
import { Switch } from 'antd'



const RecordSwitch: FunctionComponent<Object> = () => {
    return (
        <span>
            Record list <Switch checkedChildren="开" unCheckedChildren="关" />
        </span>
    )
}

export default RecordSwitch