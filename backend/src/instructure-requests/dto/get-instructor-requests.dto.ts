import { IsOptional, IsString, IsIn, IsNumberString } from 'class-validator';

export class GetInstructorRequestsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['Pending', 'Approved', 'Rejected'])
  status?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  pageSize?: string;
}
