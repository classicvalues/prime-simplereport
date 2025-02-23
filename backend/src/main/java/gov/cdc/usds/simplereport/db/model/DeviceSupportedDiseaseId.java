package gov.cdc.usds.simplereport.db.model;

import java.io.Serializable;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class DeviceSupportedDiseaseId implements Serializable {
  private UUID deviceTypeId;
  private UUID supportedDiseaseId;
}
