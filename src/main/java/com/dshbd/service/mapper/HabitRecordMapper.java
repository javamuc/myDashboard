package com.dshbd.service.mapper;

import com.dshbd.domain.HabitRecord;
import com.dshbd.service.dto.HabitRecordDTO;
import java.util.List;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = { HabitMapper.class, UserMapper.class })
public interface HabitRecordMapper {
    HabitRecordDTO toDto(HabitRecord habitRecord);

    List<HabitRecordDTO> toDto(List<HabitRecord> habitRecords);

    @Mapping(target = "userId", ignore = true)
    HabitRecord toEntity(HabitRecordDTO habitRecordDTO);

    List<HabitRecord> toEntity(List<HabitRecordDTO> habitRecordDTOs);

    @Mapping(target = "userId", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(@MappingTarget HabitRecord entity, HabitRecordDTO dto);
}
