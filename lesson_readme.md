Q. on backend driverNumber key as driverMobileNumber and driverNumber as dlNumber can you update here?


I updated three files, all with the same rename of driverNumber to driverMobileNumber:

src/types/loading-slip.ts: the type field.
src/features/loading-slip/schemas/loading-slip-schema.ts: the validation rule for the 10-digit mobile number.
src/features/loading-slip/pages/create-loading-slip-page.tsx: the form default value, the field-name list, the input id and label, the error lookup, and the register call.
I didn't touch any other files. dlNumber was already named correctly, so it is unchanged.



