import { CanDeactivateFn } from "@angular/router";
import { CanComponentDeactivate } from "../_classes/candeactivate";

export const BeforeLeavingGamemodeGuard: CanDeactivateFn<CanComponentDeactivate> = (
    component: CanComponentDeactivate
) => {
        if (component.canDeactivate()) {
            return true;
        } else {
            return false;
    }
}